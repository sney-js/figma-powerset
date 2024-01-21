import { arrValue } from '../plugin/Utils';
import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyItem,
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
} from './Messages';

export const propIsInstanceType = (
  compProp: PSComponentPropertyItems
): compProp is PSComponentPropertyItemInstanceData =>
  compProp.type === 'INSTANCE_SWAP';

export const propIsBooleanType = (
  compProp: PSComponentPropertyItems
): compProp is PSComponentPropertyItem => compProp.type === 'BOOLEAN';

export const sortPropsOfCompPropDef = (
  compPropDef: PSComponentPropertyDefinitions
): string[] => {
  const generalSort = (keys = Object.keys(compPropDef)): string[] =>
    keys.sort((a, b) => {
      const isInstance = (x) => (propIsInstanceType(compPropDef[x]) ? 2 : 0);
      const isLinkedToLayer = (x) => (x.indexOf('#') !== -1 ? 1 : 0);

      const allSortFunc = (x) => isInstance(x) + isLinkedToLayer(x);

      return allSortFunc(a) - allSortFunc(b);
    });

  function sortKeysByDependency() {
    const keys = Object.keys(compPropDef);
    let sortedKeys = [];

    // First pass: add all keys without disabledByProperty
    keys.forEach((key) => {
      if (!arrValue(compPropDef[key].disabledByProperty)) {
        sortedKeys.push(key);
      }
    });
    sortedKeys = generalSort(sortedKeys)


    // Second pass: insert keys with disabledByProperty after the location of dependency key
    keys.forEach((key) => {
      if (compPropDef[key].disabledByProperty) {
        const dependencies = compPropDef[key].disabledByProperty;
        let maxIndex = -1;
        dependencies.forEach((dependency) => {
          const index = sortedKeys.indexOf(dependency);
          if (index > maxIndex) {
            maxIndex = index;
          }
        });
        sortedKeys.splice(maxIndex + 1, 0, key);
      }
    });
    return sortedKeys;
  }

  return sortKeysByDependency();
};
