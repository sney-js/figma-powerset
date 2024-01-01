/**
 * Creates a powerSet of an array. i.e returns all possible combinations of array values
 * @param list : string[]
 * @private
 */
export const powerSet2 = (list: string[]): string[][] => {
  /*
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
  */

  const listSize: number = list.length;
  const combinationsCount: number = 1 << listSize;

  return Array.from({ length: combinationsCount }, (_, i) =>
    list.filter((_, j) => i & (1 << j))
  ).slice(1);
};

/**
 * Generates the power set of a given list.
 *
 * The power set is the set of all possible combinations of elements in the list.
 * Each combination is represented as an array of elements.
 * The order of elements in each combination matches the order of elements in the input list.
 * The order of combinations in the power set is determined by the binary representations of the numbers from 1 to 2^n - 1,
 * where n is the number of elements in the list.
 *
 * @param {string[]} list - The list of elements to generate the power set from.
 * @param {number} minPropSize
 * @returns {string[][]} The power set of the list.
 */
export const powerSet = (list: string[], minPropSize: number): string[][] => {
  const set: string[][] = [];
  let s = [];
  const generate = (start: number, subset: string[]) => {
    if (subset.length >= minPropSize) {
      set.push(subset);
    }
    for (let i = start; i < list.length; i++) {
      s.push(new Array(list.length - start).fill('#').join(''));
      generate(i + 1, [...subset, list[i]]);
    }
  };

  generate(0, []);
  // console.log(s);
  return set;
};

const KEY_DIV = '_' as const;

function convertKeyValueToKeys(props: Record<string, any>): {
  requiredKeys: Set<string>;
  transformedKeys: string[];
} {
  const transformedKeys: string[] = [];
  const requiredKeys: Set<string> = new Set<string>();

  for (const key in props) {
    if (Array.isArray(props[key])) {
      props[key].forEach((_x: unknown, i: number) => {
        transformedKeys.push(`${key}${KEY_DIV}${i}`);
        requiredKeys.add(key);
      });
    } else {
      transformedKeys.push(key);
    }
  }

  return { requiredKeys, transformedKeys };
}

function extractFullPropCombinations(
  powerSet: string[][],
  requiredKeys: Set<string>,
  props: Record<string, any>
) {
  const cleanedPowerSet = new Set(
    powerSet.filter((set) => {
      const keySet = new Set(set.map((k) => k.split(KEY_DIV)[0]));
      // vals are not repeated
      const hasDuplicates = keySet.size !== set.length;
      // All required keys calculated earlier exist
      const isSuperSet = Array.from(requiredKeys).every((x) => keySet.has(x));
      return !hasDuplicates && isSuperSet;
    })
  );

  const combObj: Record<string, any>[] = [];
  cleanedPowerSet.forEach((keys) => {
    const obj = {};
    keys.forEach((k) => {
      const numSetSplit = k.split(KEY_DIV);
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
}

/**
 * Given an object with key value pair, returns all possible combinations
 * of keys along with their values
 * @param obj - {title:'a', description: 'b'}
 * @param keys - list of keys of that object
 * @returns [{title:'a'}, { description: 'b'}, {title:'a', description: 'b'}]
 */
export function generateCombinations(obj: Record<string, any>, keys: string[]) {
  if (!keys.length) return [{}];
  const result = [];
  const key = keys[0];
  const restKeys = keys.slice(1);
  const values = obj[key].length > 0 ? obj[key] : [undefined];
  for (const value of values) {
    const combinations = generateCombinations(obj, restKeys);
    for (const combination of combinations) {
      if (value !== undefined) {
        result.push({ [key]: value, ...combination });
      } else {
        result.push({ ...combination });
      }
    }
  }
  return result;
}

export const generatePropCombinations = (
  props: Record<string, any>
): Record<string, any>[] => {
  const { transformedKeys, requiredKeys } = convertKeyValueToKeys(props);
  if (!transformedKeys) return [];

  console.log({ props, transformedKeys, requiredKeys });

  const powerSetA = powerSet(transformedKeys, requiredKeys.size);
  console.log(powerSetA, 'powerSetA');

  const combObj = extractFullPropCombinations(powerSetA, requiredKeys, props);
  console.log(combObj, 'combObj');
  return combObj;
};
/**
 * To be used within sort methods.
 * @param arr1 - sort value 1
 * @param arr2 - sort value 2
 * @param array - priority string array. e.g. ['title', 'description']
 * @param index Recursive method iterator. e.g. 0
 */
export const comparatorArrayPriority = (
  arr1: object,
  arr2: object,
  array: string[],
  index: number
): number => {
  if (!index) index = 0;
  if (!array[index]) return 0;
  const key = array[index];
  if (arr1[key] && !arr2[key]) return -1;
  else if (arr2[key] && !arr1[key]) return 1;
  else {
    return comparatorArrayPriority(arr1, arr2, array, index + 1);
  }
};
