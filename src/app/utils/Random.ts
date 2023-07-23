import { loremIpsum } from 'lorem-ipsum';
import { capitalise } from './utils';

export type ExperimentThemes = 'any' | 'fun' | 'soft' | 'professional';
type MinMax = [number, number];
export type ExperimentThemeRange = Record<ExperimentThemes, MinMax>;

export const hsl = (col: { s: number; h: number; l: number }): string => {
  return 'hsl(' + col.h + ',' + col.s + '%,' + col.l + '%)';
};

export class RandomGen {
  seed: number;
  subKey: number;

  constructor(seed?: number) {
    this.seed = seed || Math.random();
    this.subKey = 0;
  }

  key(subKey: string): RandomGen {
    this.subKey = RandomGen._hashString(subKey);
    return this;
  }

  private _rand() {
    let s = this.seed + this.subKey;
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  }

  randWord(count?: number): string {
    return capitalise(loremIpsum({ units: 'word', count: count || 1 }));
  }

  randSentence(count?: number): string {
    return capitalise(loremIpsum({ units: 'sentences', count: count || 1 }));
  }

  private static _hashString(str: string) {
    let hash = 0;
    let i = 0;
    const len = str.length;
    while (i < len) {
      hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
    }
    return hash;
  }

  random(): number {
    return this._rand();
  }

  range(range: number[]): number {
    const min = range[0] === undefined ? 0 : range[0];
    const max = range[1] === undefined ? 1 : range[1];
    return Math.round(min - 0.5 + this.random() * (max - min + 1));
  }

  pick(nums: any[]): any {
    return nums[this.range([0, nums.length - 1])];
  }

  color(ranges: { h: MinMax; s: MinMax; l: MinMax }): {
    s: number;
    h: number;
    l: number;
  } {
    const hue = this.key(this.subKey + '-h').range(ranges.h);
    const sat = this.key(this.subKey + '-s').range(ranges.s);
    const light = this.key(this.subKey + '-l').range(ranges.l);
    return {
      h: hue | 0,
      s: sat | 0,
      l: light | 0,
    };
  }
}

/**
 * Creates a powerSet of an array. i.e returns all possible combinations of array values
 * @param list : string[]
 * @private
 */
export const powerSet = (list: string[]): string[][] => {
  const set: string[][] = [];
  const listSize: number = list.length;
  const combinationsCount: number = 1 << listSize;

  for (let i = 1; i < combinationsCount; i++) {
    const combination: Array<string> = [];
    for (let j = 0; j < listSize; j++) {
      if (i & (1 << j)) {
        combination.push(list[j]);
      }
    }
    set.push(combination);
  }
  return set;
};

/**
 * Given an object with key value pair, returns all possible combinations
 * of keys along with their values
 * @param props : {title:'a', description: 'b'}
 * @returns [{title:'a'}, { description: 'b'}, {title:'a', description: 'b'}]
 */
export const generatePropCombinations = (props: Record<string, any>): Record<string, any>[] => {
  let extraKeys: string[] = [];
  const transformedKeys = Object.keys(props)
    .map((key) => {
      if (Array.isArray(props[key])) {
        extraKeys = extraKeys.concat(props[key].map((_x: unknown, i: number) => `${key}_${i}`));
        return undefined;
      } else {
        return key;
      }
    })
    .concat(extraKeys)
    .filter((x) => x) as string[];

  if (!transformedKeys) return [];

  const requiredKeys = new Set(transformedKeys.filter((k) => k.indexOf('_') !== -1).map((k) => k.split('_')[0]));
  const powerSetA = powerSet(transformedKeys);

  const cleanedPowerSet = new Set(
    powerSetA.filter((set) => {
      const keySet = new Set(set.map((k) => k.split('_')[0]));
      const hasDuplicates = keySet.size !== set.length;
      const isSuperSet = Array.from(requiredKeys).every((x) => keySet.has(x));
      return !hasDuplicates && isSuperSet;
    })
  );

  const combObj: Record<string, any>[] = [];
  cleanedPowerSet.forEach((keys) => {
    const obj = {};
    keys.forEach((k) => {
      const numSetSplit = k.split('_');
      const number = parseInt(numSetSplit[1]);
      if (number >= 0) {
        obj[numSetSplit[0]] = props[numSetSplit[0]][number];
      } else {
        obj[k] = props[k];
      }
    });
    combObj.push(obj);
  });
  return combObj;
};
/**
 * To be used within sort methods.
 * @param arr1 - sort value 1
 * @param arr2 - sort value 2
 * @param array - priority string array. e.g. ['title', 'description']
 * @param index Recursive method iterator. e.g. 0
 */
export const comparatorArrayPriority = (arr1: object, arr2: object, array: string[], index: number): number => {
  if (!index) index = 0;
  if (!array[index]) return 0;
  const key = array[index];
  if (arr1[key] && !arr2[key]) return -1;
  else if (arr2[key] && !arr1[key]) return 1;
  else {
    return comparatorArrayPriority(arr1, arr2, array, index + 1);
  }
};
