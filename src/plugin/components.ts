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

export function getMasterPropertiesDefinition(selection): ComponentPropertyDefinitions {
  if (!selection) return null;

  const masterComponent = getMasterComponent(selection);
  return masterComponent?.componentPropertyDefinitions;
}

export function isComponentOrVariant(
  selection: SceneNode
): selection is FrameNode | ComponentNode | InstanceNode | BooleanOperationNode {
  // || selection.type === 'COMPONENT' || selection.type === 'COMPONENT_SET';
  return selection && selection.type === 'INSTANCE';
}
