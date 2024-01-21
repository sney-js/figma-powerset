import {
  ComponentGroup,
  PSComponentPropertyDefinitions,
  PSComponentPropertyExposed,
  VariantDefPropsList,
  VariantProps,
} from '../../../models/Messages';

const ExposedInstanceUtil = {
  makeKey: (instanceKey: string, propName: string) => {
    return instanceKey + '///' + propName;
  },
  decodeKey: (propKey: string): string[] | undefined => {
    let exposedPattern = propKey.split('///');
    return exposedPattern[1] ? exposedPattern : [];
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

export const createDependencies = (
  allSelections: VariantDefPropsList,
  compDef: PSComponentPropertyDefinitions,
  exposedInstances: PSComponentPropertyExposed
): Record<string, string[]> => {
  const dependencies: Record<string, string[]> = {};
  Object.keys(allSelections).forEach((key) => {
    let disabledProperties: string[];

    // current prop dependencies
    if (compDef[key]) {
      disabledProperties = compDef[key].disabledByProperty;
    }

    // exposed instances prop dependencies
    const [exposedInstanceKey, exposedInstanceProp] =
      ExposedInstanceUtil.decodeKey(key);
    if (exposedInstanceKey) {
      let exposedInstanceCompDef = exposedInstances.find(
        (s) => s.id === exposedInstanceKey
      );
      const entireExposedInstanceDisabledBy =
        exposedInstanceCompDef?.disabledByProperty;
      const exposedInstancePropDisabledBy = exposedInstanceCompDef.variants[
        exposedInstanceProp
      ].disabledByProperty?.map((s) =>
        ExposedInstanceUtil.makeKey(exposedInstanceKey, s)
      );
      disabledProperties = Array.from(
        new Set([
          ...(exposedInstancePropDisabledBy || []),
          ...(entireExposedInstanceDisabledBy || []),
        ])
      );
    }
    if (disabledProperties && disabledProperties.length) {
      dependencies[key] = disabledProperties;
    }
  });
  return dependencies;
};
