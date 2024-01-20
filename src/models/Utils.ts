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

export function sortPropsOfCompPropDef(
  compPropDef: PSComponentPropertyDefinitions
) {
  return Object.keys(compPropDef).sort((a, b) => {
    const isInstance = (x) => (propIsInstanceType(compPropDef[x]) ? 2 : 0);
    const isLinkedToLayer = (x) => (x.indexOf('#') !== -1 ? 1 : 0);

    const allSortFunc = (x) => isInstance(x) + isLinkedToLayer(x);

    return allSortFunc(a) - allSortFunc(b);
  });
}
