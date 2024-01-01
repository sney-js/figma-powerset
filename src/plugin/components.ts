import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
} from '../models/Messages';
import { propIsInstanceType } from '../models/Utils';

export function getMasterComponent(
  selection
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
  let masterDef: PSComponentPropertyDefinitions =
    masterComponent?.componentPropertyDefinitions;
  if (!masterDef) return masterDef;
  const currentDefinitions = selection.componentProperties;
  const compPropDef: PSComponentPropertyDefinitions = { ...masterDef };

  for (const instance of selection.exposedInstances) {
    const exposedVariantProperties: PSComponentPropertyDefinitions =
      await getMasterPropertiesDefinition(instance, asyncComponentFetch);
    compPropDef[instance.name] = {
      type: 'EXPOSED_INSTANCE',
      defaultValue: false,
      properties: exposedVariantProperties,
    };
  }

  for (const prop of Object.keys(compPropDef)) {
    const compPropDefEl: PSComponentPropertyItems = compPropDef[prop];
    const currentInstancePropValue = currentDefinitions[prop]?.value;

    switch (compPropDefEl.type) {
      case 'INSTANCE_SWAP': {
        if (!propIsInstanceType(compPropDefEl)) return;
        compPropDefEl.instanceData = await createInstanceData(
          compPropDefEl,
          asyncComponentFetch
        );

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
