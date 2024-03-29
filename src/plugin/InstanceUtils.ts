import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyExposed,
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
  PSLayerInfo,
} from '../models/Messages';
import { propIsBooleanType, propIsInstanceType } from '../models/Utils';
import { arrValue, objValue } from './Utils';

export function getMasterComponent(
  selection: InstanceNode | ComponentNode | ComponentSetNode | BaseNode
): ComponentSetNode | ComponentNode {
  if (!selection) return null;

  if (selection.type === 'INSTANCE') {
    return getMasterComponent(selection.mainComponent);
  } else if (selection.parent?.type === 'COMPONENT_SET') {
    return selection.parent;
  } else if (selection.type === 'COMPONENT') {
    return selection;
  } else {
    return null;
  }
}

export async function getExposedInstanceProperties(
  selection: InstanceNode,
  asyncComponentFetch: boolean,
  compDef: PSComponentPropertyDefinitions
): Promise<PSComponentPropertyExposed> {
  const exposedInstances: PSComponentPropertyExposed = [];
  let instanceNode = selection;

  const childLayersPropertyReferences =
    createPropertyDependencies(instanceNode);

  for (const exInstance of instanceNode.exposedInstances) {
    let disabledByProperty: string[];
    const availableFrames = childLayersPropertyReferences.filter(
      (s) => s.name === exInstance.name
    );
    const exposedInstanceFrame = availableFrames.find(
      (s) => exInstance.id.indexOf(s.id) !== -1
    );
    if (exposedInstanceFrame) {
      disabledByProperty = exposedInstanceFrame.dependencies;
      const mainComponent = exposedInstanceFrame.value?.mainComponent;
      if (mainComponent) {
        const dProp = `${mainComponent}=${compDef[mainComponent].defaultValue}`;
        disabledByProperty.push(dProp);
      }
    }

    exposedInstances.push({
      variants: await getMasterPropertiesDefinition(
        exInstance,
        asyncComponentFetch
      ),
      name: exInstance.name,
      id: exInstance.id,
      disabledByProperty: arrValue(disabledByProperty) || [],
    });
  }
  return exposedInstances;
}

export type FindLayerTypeGeneric<T> = PSLayerInfo & {
  value?: T;
  skippedParent?: string;
};
/**
 * Generic function that Finds all layers within children of children that satisfy
 * the valueMapFunction with a 'defined' value
 * @param selection
 * @param valueMapFunc
 * @param filterFunc - return true false to avoid traversing children of this node again
 * @param parentId
 * @return { {name:string, id:string, ?value:T}[] }
 */
export const findChildrenWith = <T>(
  selection: SceneNode,
  valueMapFunc: (node: SceneNode) => T,
  filterFunc?: (node: SceneNode) => boolean,
  parentId?: string
): FindLayerTypeGeneric<T>[] => {
  let ids: FindLayerTypeGeneric<T>[] = [];

  let skippedParent = parentId;
  const value = valueMapFunc(selection);
  if (value) {
    ids.push({
      name: selection.name,
      id: selection.id,
      value: value,
      skippedParent: parentId,
    });
    skippedParent = selection.id;
  }

  let traverseNode = true;
  if (filterFunc) traverseNode = filterFunc(selection);
  if (traverseNode && 'children' in selection && selection.children?.length) {
    for (let child of selection.children) {
      ids = ids.concat(
        findChildrenWith(child, valueMapFunc, filterFunc, skippedParent)
      );
    }
  }

  return ids;
};

/**
 * Generic function that Finds all layers within children of children that satisfy
 * the valueMapFunction with a 'defined' value
 * @param selection
 * @param valueMapFunc
 * @param stopNode - node to stop the search on
 * @return { {name:string, id:string, ?value:T}[] }
 */
export const findParentWith = <T>(
  selection: SceneNode,
  valueMapFunc: (node: SceneNode) => T,
  stopNode: SceneNode
): FindLayerTypeGeneric<T> | null => {
  if (!valueMapFunc) {
    return { name: selection.name, id: selection.id };
  } else {
    const value = valueMapFunc(selection);
    if (value) {
      return { name: selection.name, id: selection.id, value: value };
    }
  }

  if ('parent' in selection && selection.parent) {
    let parent = selection.parent;
    if (parent.id === stopNode.id) return null;
    return findParentWith(parent as SceneNode, valueMapFunc, stopNode);
  }

  return null;
};

export const createChildrenTree = (selection: SceneNode) => {
  let result: Record<string, any> = {};

  if ('children' in selection) {
    if (selection.children?.length) {
      for (let child of selection.children) {
        const key = `${child.name}[${child.id}]`;
        result[key] = createChildrenTree(child);
      }
    }
  }
  return result;
};

async function generatePreferredValuesData(
  preferredValue: InstanceSwapPreferredValue,
  compPropDefEl: PSComponentPropertyItemInstanceData,
  currentSelectedId: string
): Promise<
  PSComponentPropertyItemInstanceData['instanceData'][number] | undefined
> {
  let compFetchFunc: Function =
    preferredValue.type === 'COMPONENT_SET'
      ? figma.importComponentSetByKeyAsync
      : figma.importComponentByKeyAsync;

  return await compFetchFunc(preferredValue.key)
    .then((node: ComponentNode | ComponentSetNode) => {
      let { id, name } = node;
      if (node.type === 'COMPONENT_SET') {
        id = node.defaultVariant.id;
      }
      if (id === currentSelectedId) {
        name += ' (Current)';
      }
      if (!propIsInstanceType(compPropDefEl)) return;
      return { name, id };
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    });
}

const createPropertyDependencies = (
  selection: InstanceNode
): (FindLayerTypeGeneric<SceneNodeMixin['componentPropertyReferences']> & {
  dependencies: string[];
})[] => {
  const masterComponent: ComponentSetNode | ComponentNode =
    getMasterComponent(selection);

  const childLayersPropertyReferences = findChildrenWith<
    SceneNodeMixin['componentPropertyReferences']
  >(
    masterComponent,
    (inst) => objValue(inst.componentPropertyReferences),
    (inst) => inst.id === selection.id || !isInstance(inst)
  );

  function findParents(parentId: string = null, depth = 0) {
    const item = childLayersPropertyReferences.find(
      (item) => item.id === parentId
    );
    if (depth >= 0 && item?.value?.visible && !item?.skippedParent) {
      return [item.value.visible];
    }
    if (item?.skippedParent) {
      return Array.from(
        new Set([...findParents(item.skippedParent, ++depth)].filter(Boolean))
      );
    }
    return [];
  }

  return childLayersPropertyReferences.map((item) => {
    let dependencies = findParents(item.id);
    return { ...item, dependencies: dependencies };
  });
};

export async function getMasterPropertiesDefinition(
  selection: InstanceNode,
  asyncComponentFetch: boolean
): Promise<PSComponentPropertyDefinitions> {
  if (!selection) return null;

  const masterComponent: ComponentSetNode | ComponentNode =
    getMasterComponent(selection);
  const masterDef: ComponentPropertyDefinitions =
    masterComponent?.componentPropertyDefinitions;
  if (!masterDef) return masterDef;
  const currentDefinitions = selection.componentProperties;
  const compPropDef: PSComponentPropertyDefinitions = {
    ...(masterDef as ComponentPropertyDefinitions),
  };

  const childLayersPropertyReferences = createPropertyDependencies(selection);

  for (const prop of Object.keys(compPropDef)) {
    const compPropDefEl: PSComponentPropertyItems = compPropDef[prop];
    const currentInstancePropValue = currentDefinitions[prop]?.value;

    const disabledByProperty = childLayersPropertyReferences.find((v) =>
      Object.values(v.value).find((s) => s === prop)
    )?.dependencies;
    if (disabledByProperty?.length) {
      compPropDefEl.disabledByProperty = disabledByProperty.filter(
        (s) => s !== prop
      );
    }

    switch (compPropDefEl.type) {
      case 'BOOLEAN': {
        if (!propIsBooleanType(compPropDefEl)) return;

        if (currentInstancePropValue) {
          compPropDefEl.defaultValue = currentInstancePropValue;
        }

        break;
      }
      case 'INSTANCE_SWAP': {
        if (!propIsInstanceType(compPropDefEl)) return;
        const prefInstanceId = currentInstancePropValue as string;
        compPropDefEl.defaultValue = currentInstancePropValue;

        if (asyncComponentFetch) {
          let instanceData: PSComponentPropertyItemInstanceData['instanceData'] =
            await Promise.all(
              compPropDefEl.preferredValues.map(async (pref) => {
                return await generatePreferredValuesData(
                  pref,
                  compPropDefEl,
                  String(currentInstancePropValue)
                );
              })
            );
          instanceData = instanceData.filter((s) => s?.id);

          // current added instance that may not be found in preferred instances
          if (!instanceData.some(({ id }) => id === prefInstanceId)) {
            const prevInstanceNode = getMasterComponent(
              figma.getNodeById(prefInstanceId)
            )?.name;
            instanceData.push({
              name: prevInstanceNode + ' (Current)',
              id: prefInstanceId,
            });
          }

          compPropDefEl.instanceData = instanceData.filter(Boolean);
        }

        break;
      }
      default: {
        if (currentInstancePropValue) {
          compPropDefEl.defaultValue = currentInstancePropValue;
        }
      }
    }
  }

  return compPropDef;
}

export function isInstance(selection: SceneNode): selection is InstanceNode {
  return selection && selection.type === 'INSTANCE';
}

export function isComponentSet(
  selection: SceneNode
): selection is ComponentSetNode {
  return selection && selection.type === 'COMPONENT_SET';
}

export function isComponent(selection: SceneNode): selection is ComponentNode {
  return selection && selection.type === 'COMPONENT';
}

export function instanceExists(instance?: InstanceNode) {
  try {
    instance?.mainComponent;
    return true;
  } catch (e) {
    return false;
  }
}
