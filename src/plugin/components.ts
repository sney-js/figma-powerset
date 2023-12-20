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
  selection
): Promise<PSComponentPropertyDefinitions> {
  if (!selection) return null;

  const masterComponent = getMasterComponent(selection);
  let compPropDef: PSComponentPropertyDefinitions = masterComponent?.componentPropertyDefinitions;
  if (!compPropDef) return compPropDef;

  for (const propName in compPropDef) {
    let propVal = compPropDef[propName];
    if (propVal.type === 'INSTANCE_SWAP') {
      propVal.instanceData = [];
      for (const pref of propVal.preferredValues) {
        let compFetchFunc: Function =
          pref.type === 'COMPONENT_SET'
            ? figma.importComponentSetByKeyAsync
            : figma.importComponentByKeyAsync;

        /*
                        await compFetchFunc(pref.key)
                          .then((compNode) => {
                            propVal.instanceData.push({
                              name: compNode.name,
                              id: compNode.id,
                            });
                          })
                          .catch(console.error);
                */
      }
    }
  }
  return compPropDef;
}

export function isComponentOrVariant(
  selection: SceneNode
): selection is FrameNode | ComponentNode | InstanceNode | BooleanOperationNode {
  // || selection.type === 'COMPONENT' || selection.type === 'COMPONENT_SET';
  return selection && selection.type === 'INSTANCE';
}
