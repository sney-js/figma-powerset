import React, { useMemo } from 'react';
import { Checkbox, Label, Text } from 'react-figma-plugin-ds';

type VariantDefinitionsParams = { definitions: ComponentPropertyDefinitions };
type VariantProps = {
  [key: string]: string[] | boolean[] | VariableAlias[];
};

function Table({ properties }: { properties: VariantProps }) {
  const headers = ['#', 'Name', 'Values'];
  return (
    <div className="App">
      <table className={'table'}>
        <thead>
          <tr>
            {headers.map((name, idx) => (
              <th key={idx}>
                <Text>{name}</Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(properties).map((key, idx) => (
            <tr key={idx}>
              <td>
                <Text>{idx + 1}.</Text>
              </td>
              <td>
                <Text>{key}</Text>
              </td>
              <td>
                {properties[key].map((val) => (
                  <Checkbox label={String(val)} name={[key, val].join('.')} defaultValue={true} />
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function VariantDefinitions(props: VariantDefinitionsParams) {
  const { definitions = {} } = props;
  const variantDef: VariantProps = useMemo(() => {
    if (!definitions) return {};
    const obj = {};
    Object.keys(definitions).forEach((key) => {
      const val = definitions[key];
      switch (val.type) {
        case 'BOOLEAN':
          obj[key] = [true, false];
          break;
        case 'TEXT':
          obj[key] = [val.defaultValue, 'Custom'];
          break;
        case 'INSTANCE_SWAP':
          break;
        case 'VARIANT':
          obj[key] = val.variantOptions;
          break;
      }
    });
    return obj;
  }, [definitions]);
  // const powersets = powerSet()
  return (
    <div>
      <Table properties={variantDef} />
    </div>
  );
}
