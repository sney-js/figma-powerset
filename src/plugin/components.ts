import { PSComponentPropertyDefinitions } from '../models/Messages';

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

export async function getMasterPropertiesDefinition(
  selection: InstanceNode,
  asyncComponentFetch: boolean
): Promise<PSComponentPropertyDefinitions> {
  if (!selection) return null;

  const masterComponent = getMasterComponent(selection);
  let masterDef: PSComponentPropertyDefinitions = masterComponent?.componentPropertyDefinitions;
  if (!masterDef) return masterDef;
  const currentDefinitions = selection.componentProperties;

  const sortedProps = Object.keys(masterDef).sort((a, b) => {
    const isInstance = (x) => (masterDef[x].type === 'INSTANCE_SWAP' ? 2 : 0);
    const isLinkedToLayer = (x) => (x.indexOf('#') !== -1 ? 1 : 0);
    const allSortFunc = (x) => isInstance(x) + isLinkedToLayer(x);
    return allSortFunc(a) - allSortFunc(b);
  });
  const compPropDef: PSComponentPropertyDefinitions = {};
  for (const prop of sortedProps) {
    compPropDef[prop] = masterDef[prop];

    const instancePropValue = currentDefinitions[prop].value;
    if (instancePropValue) {
      compPropDef[prop].defaultValue = instancePropValue;
    }

    switch (compPropDef[prop].type) {
      case 'INSTANCE_SWAP': {
        const prefInstanceId = instancePropValue as string;
        compPropDef[prop].instanceData = [];

        for (const pref of compPropDef[prop].preferredValues) {
          let compFetchFunc: Function =
            pref.type === 'COMPONENT_SET'
              ? figma.importComponentSetByKeyAsync
              : figma.importComponentByKeyAsync;

          if (asyncComponentFetch) {
            await compFetchFunc(pref.key)
              .then((node: ComponentNode | ComponentSetNode) => {
                let { id, name } = node;
                if (node.type === 'COMPONENT_SET') {
                  id = node.defaultVariant.id;
                }
                compPropDef[prop].instanceData.push({ name, id });
              })
              .catch((e: Error) => {
                console.error(e);
              });
          }
        }

        if (!compPropDef[prop].instanceData.some(({ id }) => id === prefInstanceId)) {
          const prevInstanceNode = getMasterComponent(figma.getNodeById(prefInstanceId))?.name;
          compPropDef[prop].instanceData.push({
            name: prevInstanceNode || 'Current',
            id: prefInstanceId,
          });
        }

        break;
      }
    }
  }
  return compPropDef;
}

export function isInstance(selection: SceneNode): selection is InstanceNode {
  // || selection.type === 'COMPONENT' || selection.type === 'COMPONENT_SET';
  return selection && selection.type === 'INSTANCE';
}
