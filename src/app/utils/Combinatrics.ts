type PRecord = Record<string, (string | boolean | undefined)[]>;

type PRecordOut = Record<string, string | boolean>;

/**
 * Given an object with key value pair, returns all possible combinations
 * of keys along with their values
 * @param obj - {title:'a', description: 'b'}
 * @param keys - list of keys of that object
 * @returns [{title:'a'}, { description: 'b'}, {title:'a', description: 'b'}]
 */
export function generateCombinations(
  obj: PRecord,
  keys: string[]
): PRecordOut[] {
  if (!keys.length) return [{}];
  const result: PRecordOut[] = [];
  const key: string = keys[0];
  const restKeys: string[] = keys.slice(1);
  const values: PRecord[string] = obj[key].length > 0 ? obj[key] : [undefined];
  for (const value of values) {
    const combinations: PRecordOut[] = generateCombinations(obj, restKeys);
    for (const combination of combinations) {
      if (value !== undefined) {
        const items: PRecordOut = { [key]: value, ...combination };
        result.push(items);
      } else {
        result.push({ ...combination });
      }
    }
  }
  return result;
}

/**
 * Given an object with key value pair, returns all possible combinations
 * of keys along with their values
 * @param obj - {title:'a', description: 'b'}
 * @returns [{title:'a'}, { description: 'b'}, {title:'a', description: 'b'}]
 */
export function generatePowerset(obj: PRecord): PRecordOut[] {
  return generateCombinations(obj, Object.keys(obj));
}
