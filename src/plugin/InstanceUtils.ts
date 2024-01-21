import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyExposed,
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
  PSLayerInfo,
} from '../models/Messages';
import { propIsBooleanType, propIsInstanceType } from '../models/Utils';
import { objValue } from './Utils';

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

/**
 *  Setting powerset of instance swap or exposed instance is pointless if the parent
 *  layer will be hidden due to its property. This renders duplicate instances that do not seem to
 *  be distinct. This method finds properties that will disable this instance.
 *  The value of these properties must be true for this instance to take effect.
 */
function findPropertiesThatWillDisableThisInstance(
  instance: InstanceNode,
  componentDefinition: PSComponentPropertyDefinitions,
  topMostNode: SceneNode
): PSComponentPropertyExposed[number]['disabledByProperty'] {
  const disabledByProperties: string[] = [];
  for (let prop in componentDefinition) {
    let variantProperty = componentDefinition[prop];
    if (propIsBooleanType(variantProperty)) {
      for (let s of variantProperty?.controlsLayers || []) {
        if (instance.id.indexOf(s.id) === 0) {
          disabledByProperties.push(prop);
        }
        const parentWithProperty = findParentWith(
          instance,
          (parent) => (parent.id === s.id ? parent.id : null),
          topMostNode
        );
        if (parentWithProperty) {
          disabledByProperties.push(prop);
        }
      }
    }
  }
  return disabledByProperties.length ? disabledByProperties : undefined;
}

export async function getExposedInstanceProperties(
  selection: InstanceNode,
  componentDefinition: PSComponentPropertyDefinitions,
  asyncComponentFetch: boolean
): Promise<PSComponentPropertyExposed> {
  const exposedInstances: PSComponentPropertyExposed = [];
  const masterComponent = getMasterComponent(selection);
  for (const instance of selection.exposedInstances) {
    console.log(instance.componentPropertyReferences, instance.name, 'XXX');
    exposedInstances.push({
      variants: await getMasterPropertiesDefinition(
        instance,
        asyncComponentFetch
      ),
      name: instance.name,
      id: instance.id,
      disabledByProperty: findPropertiesThatWillDisableThisInstance(
        instance,
        componentDefinition,
        masterComponent
      ),
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
  compPropDefEl: PSComponentPropertyItemInstanceData
): Promise<
  PSComponentPropertyItemInstanceData['instanceData'][number] | undefined
> {
  let compFetchFunc: Function =
    preferredValue.type === 'COMPONENT_SET'
      ? figma.importComponentSetByKeyAsync
      : figma.importComponentByKeyAsync;

  await compFetchFunc(preferredValue.key)
    .then((node: ComponentNode | ComponentSetNode) => {
      let { id, name } = node;
      if (node.type === 'COMPONENT_SET') {
        id = node.defaultVariant.id;
      }
      if (!propIsInstanceType(compPropDefEl)) return;
      return { name, id };
    })
    .catch(console.error);
  return undefined;
}

const createPropertyDependencies = (
  selection: InstanceNode
): (FindLayerTypeGeneric<SceneNodeMixin['componentPropertyReferences']> & {
  dependencies: string[];
})[] => {
  const masterComponent: ComponentSetNode | ComponentNode =
    getMasterComponent(selection);
  let childLayersPropertyReferences: FindLayerTypeGeneric<
    SceneNodeMixin['componentPropertyReferences']
  >[] = findChildrenWith<SceneNodeMixin['componentPropertyReferences']>(
    masterComponent,
    (inst) => objValue(inst.componentPropertyReferences),
    (inst) => inst.id === selection.id || !isInstance(inst)
  );

  function findParents(parentId = null, depth = 0) {
    const item = childLayersPropertyReferences.find(
      (item) => item.id === parentId
    );
    if (depth > 0 && item?.value?.visible) return [item.value.visible];
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
      compPropDefEl.disabledByProperty = disabledByProperty;
    }

    switch (compPropDefEl.type) {
      case 'BOOLEAN': {
        if (!propIsBooleanType(compPropDefEl)) return;

        if (currentInstancePropValue) {
          compPropDefEl.defaultValue = currentInstancePropValue;
        }
        const layerProperties = prop.split('#')[1];
        if (layerProperties) {
          const visibleLayers = childLayersPropertyReferences
            .filter((v) => v.value.visible === prop)
            .map((c) => ({ name: c.name, id: c.id }));
          compPropDefEl.controlsLayers = visibleLayers;
        }

        break;
      }
      case 'INSTANCE_SWAP': {
        if (!propIsInstanceType(compPropDefEl)) return;

        if (asyncComponentFetch) {
          let instanceData: PSComponentPropertyItemInstanceData['instanceData'] =
            await Promise.all(
              compPropDefEl.preferredValues.map((pref) =>
                generatePreferredValuesData(pref, compPropDefEl)
              )
            );
          compPropDefEl.instanceData = instanceData.filter(Boolean);
        }

        // current added instance that may not be found in preferred instances
        const prefInstanceId = currentInstancePropValue as string;
        if (
          !compPropDefEl.instanceData.some(({ id }) => id === prefInstanceId)
        ) {
          const prevInstanceNode = getMasterComponent(
            figma.getNodeById(prefInstanceId)
          )?.name;
          compPropDefEl.instanceData.push({
            name: prevInstanceNode + ' (Current)',
            id: prefInstanceId,
          });
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
  // || selection.type === 'COMPONENT' || selection.type === 'COMPONENT_SET';
  return selection && selection.type === 'INSTANCE';
}

export function instanceExists(instance?: InstanceNode) {
  try {
    instance?.mainComponent;
    return true;
  } catch (e) {
    return false;
  }
}
