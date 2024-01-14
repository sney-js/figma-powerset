import {
  ComponentGroup,
  PSComponentPropertyExposed,
  VariantDefPropsList,
  VariantProps,
} from '../../../models/Messages';

const ExposedInstanceUtil = {
  makeKey: (instanceKey: string, propName: string) => {
    return instanceKey + '///' + propName;
  },
  decodeKey: (propKey: string) => {
    return propKey.split('///');
  },
} as const;

export const flattenUserSelection = (
  userSelections: Record<string, VariantDefPropsList>,
  mainKey: string
): VariantDefPropsList => {
  let allSelections: VariantDefPropsList = {};

  for (const instanceKey in userSelections) {
    for (const prop in userSelections[instanceKey]) {
      let propName = prop;
      if (instanceKey !== mainKey) {
        propName = ExposedInstanceUtil.makeKey(instanceKey, prop);
      }
      allSelections[propName] = userSelections[instanceKey][prop];
    }
  }
  return allSelections;
};

export function formatExposedInstances(
  powerset: Array<VariantProps>
): ComponentGroup[number]['items'] {
  const responseData: ComponentGroup[number]['items'] = [...powerset];
  for (let i = 0; i < responseData.length; i++) {
    responseData[i].__exposedInstances = {};
    for (const prop in responseData[i]) {
      let [instanceKey, propName] = ExposedInstanceUtil.decodeKey(prop);
      if (propName) {
        let exposedInstanceItem =
          responseData[i].__exposedInstances[instanceKey];

        if (!exposedInstanceItem)
          responseData[i].__exposedInstances[instanceKey] = {};
        responseData[i].__exposedInstances[instanceKey][propName] =
          responseData[i][prop];
        delete responseData[i][prop];
      }
    }
  }
  return responseData;
}

export function createDependencies(
  allSelections: VariantDefPropsList,
  exposedInstances: PSComponentPropertyExposed
) {
  const dependencies: Record<string, string[]> = {};
  Object.keys(allSelections).forEach((key) => {
    const [instanceKey] = ExposedInstanceUtil.decodeKey(key);
    const disabledProperties = exposedInstances.find(
      (s) => s.id === instanceKey
    )?.disabledByProperty;
    if (disabledProperties && disabledProperties.length) {
      dependencies[key] = disabledProperties;
    }
  });
  return dependencies;
}
