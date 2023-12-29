import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyItemExposedInstance,
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
} from '../models/Messages';

export function getMasterComponent(selection): ComponentSetNode | ComponentNode {
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

const propIsInstanceType = (
  compProp: PSComponentPropertyItems
): compProp is PSComponentPropertyItemInstanceData => compProp.type === 'INSTANCE_SWAP';

const propIsExposedInstanceType = (
  compProp: PSComponentPropertyItems
): compProp is PSComponentPropertyItemExposedInstance => compProp.type === 'EXPOSED_INSTANCE';

function sortedCompPropDefs(
  compPropDef: PSComponentPropertyDefinitions
): PSComponentPropertyDefinitions {
  const sortedProps = Object.keys(compPropDef).sort((a, b) => {
    const isInstance = (x) => (propIsInstanceType(compPropDef[x]) ? 2 : 0);
    const isExposedInstance = (x) => (propIsExposedInstanceType(compPropDef[x]) ? 3 : 0);
    const isLinkedToLayer = (x) => (x.indexOf('#') !== -1 ? 1 : 0);

    const allSortFunc = (x) => isInstance(x) + isLinkedToLayer(x) + isExposedInstance(x);

    return allSortFunc(a) - allSortFunc(b);
  });

  return sortedProps.reduce((obj, key) => {
    obj[key] = compPropDef[key];
    return obj;
  }, {});
}

async function createInstanceData(
  compPropDefEl: PSComponentPropertyItemInstanceData,
  asyncComponentFetch: boolean
): Promise<PSComponentPropertyItemInstanceData['instanceData']> {
  let instanceData: PSComponentPropertyItemInstanceData['instanceData'] = [];
  if (asyncComponentFetch) {
    for (const pref of compPropDefEl.preferredValues) {
      let compFetchFunc: Function =
        pref.type === 'COMPONENT_SET'
          ? figma.importComponentSetByKeyAsync
          : figma.importComponentByKeyAsync;

      await compFetchFunc(pref.key)
        .then((node: ComponentNode | ComponentSetNode) => {
          let { id, name } = node;
          if (node.type === 'COMPONENT_SET') {
            id = node.defaultVariant.id;
          }
          if (!propIsInstanceType(compPropDefEl)) return;
          instanceData.push({ name, id });
        })
        .catch(console.error);
    }
  }
  return instanceData;
}

export async function getMasterPropertiesDefinition(
  selection: InstanceNode,
  asyncComponentFetch: boolean
): Promise<PSComponentPropertyDefinitions> {
  if (!selection) return null;

  const masterComponent = getMasterComponent(selection);
  let masterDef: PSComponentPropertyDefinitions = masterComponent?.componentPropertyDefinitions;
  if (!masterDef) return masterDef;
  const currentDefinitions = selection.componentProperties;
  const compPropDef: PSComponentPropertyDefinitions = { ...masterDef };

  for (const instance of selection.exposedInstances) {
    compPropDef[instance.name] = {
      type: 'EXPOSED_INSTANCE',
      defaultValue: false,
      properties: await getMasterPropertiesDefinition(instance, asyncComponentFetch),
    };
  }

  for (const prop of Object.keys(compPropDef)) {
    const compPropDefEl: PSComponentPropertyItems = compPropDef[prop];
    const currentInstancePropValue = currentDefinitions[prop]?.value;

    switch (compPropDefEl.type) {
      case 'INSTANCE_SWAP': {
        if (!propIsInstanceType(compPropDefEl)) return;
        compPropDefEl.instanceData = await createInstanceData(compPropDefEl, asyncComponentFetch);

        const prefInstanceId = currentInstancePropValue as string;
        if (!compPropDefEl.instanceData.some(({ id }) => id === prefInstanceId)) {
          const prevInstanceNode = getMasterComponent(figma.getNodeById(prefInstanceId))?.name;
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

  return sortedCompPropDefs(compPropDef);
}

export function isInstance(selection: SceneNode): selection is InstanceNode {
  // || selection.type === 'COMPONENT' || selection.type === 'COMPONENT_SET';
  return selection && selection.type === 'INSTANCE';
}
