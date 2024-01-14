type PRecord = Record<string, (string | boolean | undefined)[]>;

type PRecordOut = Record<string, string | boolean>;

/**
 * Reduces a powerset by removing keys based on dependencies and removing duplicate combinations.
 * @param result - The powerset to be reduced.
 * @param dependencies   - An object mapping keys to their dependencies.
 * @returns The reduced powerset with no keys that fail their dependency checks and no duplicate combinations.
 */
function reducePowersetUsingDependencies(
  result: PRecordOut[],
  dependencies: Record<string, string[]>
) {
  // Remove keys from combinations based on dependencies
  const filteredResult = result.map((combination) => {
    const newCombination = { ...combination };
    Object.keys(newCombination).forEach((key) => {
      if (
        dependencies[key] &&
        !dependencies[key].every((dep) => newCombination[dep] === true)
      ) {
        delete newCombination[key];
      }
    });
    return newCombination;
  });
  // Remove duplicate combinations
  const uniqueResultsMap = new Map();
  filteredResult.forEach((item) => {
    // Derive a key from the object properties
    const key = Object.entries(item).sort().toString();
    uniqueResultsMap.set(key, item);
  });
  return Array.from(uniqueResultsMap.values());
}

/**
 * Given an object with key value pair, returns all possible combinations
 * of keys along with their values
 * @param obj - `{title:[true, false], description: ['b'], subtitle: ['wow','no']}`
 * @param keys - list of keys of that object
 * @param dependencies - `{subtitle:['title']}`
 * @returns `[{title:true, description: 'b', subtitle: 'wow'},
 * {title:false, description: 'b'}, {title: true, description: 'b', subtitle: 'no'}]`
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
 * @param dependencies - {subtitle:['title']}
 * @returns [{title:'a'}, { description: 'b'}, {title:'a', description: 'b'}]
 */
export function generatePowerset(
  obj: PRecord,
  dependencies?: Record<string, string[]>
): PRecordOut[] {
  const pRecordOuts = generateCombinations(obj, Object.keys(obj));
  return reducePowersetUsingDependencies(pRecordOuts, dependencies);
}

/*
const obj = {
  title: [true, false],
  description: [true, false],
  subtitle: ['wow', 'no'],
  caption: ['wow', 'no'],
};
const dependencies = { subtitle: ['title'], caption: ['description'] };
const pwrset = generatePowerset(obj, dependencies);
console.log(pwrset);
*/
