import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Label, Text } from 'react-figma-plugin-ds';
import { generatePropCombinations } from '../utils/Random';
import { VariantProps, VariantPropsList } from '../../models/Messages';

type VariantDefinitionsParams = {
  definitions: ComponentPropertyDefinitions;
  onUserSelect: (data: VariantProps[]) => void;
};
const TextHelperList = [
  ['Words', 'Lorem ipsum dolor sit'],
  ['Sentence', 'Lorem ipsum dolor sit amet, consectetur adipisici elit.'],
  [
    'Paragraph',
    `Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. 
  
  Gallia est omnis divisa in partes tres, quarum.
  
  Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.`,
  ],
];

export function VariantDefinitions(props: VariantDefinitionsParams) {
  const { definitions, onUserSelect } = props;

  const [masterDefinitions, setMasterDefinitions] = useState<VariantPropsList>();
  const [userDefinitions, setUserDefinitions] = useState<VariantPropsList>();

  useEffect(() => {
    if (!definitions) return;
    const varDef = {};
    Object.keys(definitions).forEach((key) => {
      const val = definitions[key];
      switch (val.type) {
        case 'BOOLEAN':
          varDef[key] = [true, false];
          break;
        case 'TEXT':
          varDef[key] = [
            val.defaultValue,
            TextHelperList[0][1],
            TextHelperList[1][1],
            TextHelperList[2][1],
          ];
          break;
        case 'INSTANCE_SWAP':
          break;
        case 'VARIANT':
          varDef[key] = val.variantOptions;
          break;
      }
    });
    if (JSON.stringify(varDef) !== JSON.stringify(masterDefinitions || {})) {
      setMasterDefinitions(varDef);
      const userDefDefault = {};
      Object.keys(varDef).forEach((key) => {
        userDefDefault[key] = [varDef[key]?.[0]];
      });
      setUserDefinitions(userDefDefault);
    }
  }, [definitions]);

  useEffect(() => {
    if (userDefinitions) {
      const powerset: Array<VariantProps> = generatePropCombinations(userDefinitions);
      onUserSelect(powerset);
    }
  }, [userDefinitions]);

  return (
    <div>
      <table className={'table'}>
        <thead>
          <tr>
            <th style={{ width: '30px' }}>
              <Label>#</Label>
            </th>
            <th style={{ width: '100px' }}>
              <Label>Properties</Label>
            </th>
            <th>
              <Label>Values</Label>
            </th>
          </tr>
        </thead>
        <tbody>
          {masterDefinitions &&
            Object.keys(masterDefinitions).map((propName, i) => (
              <tr key={propName + i}>
                <td>
                  <Label>{i + 1}.</Label>
                </td>
                <td>
                  <Text className={'pl-xxsmall'}>
                    {propName.split('#')[0]}
                  </Text>
                </td>
                <td>
                  {masterDefinitions[propName].map((val, j) => {
                    let classes = [];
                    let defaultChecked = j === 0;
                    if (userDefinitions) {
                      defaultChecked = userDefinitions[propName]?.some((x) => x === val);
                    }
                    let value = String(val);
                    if (definitions[propName]?.type === 'TEXT') {
                      let prettyName = TextHelperList.find((x) => x[1] === value);

                      if (prettyName) {
                        value = prettyName[0]+'*';
                        classes.push('italics');
                      } else {
                        value = `'${value}'`;
                      }
                      classes = classes.filter(Boolean);
                    }
                    return (
                      <Checkbox
                        className={classes.join(' ')}
                        data-tooltip={'asd'}
                        label={value}
                        name={[propName, val].join('.')}
                        defaultValue={defaultChecked}
                        onChange={(_checked) => {
                          let newDef = { ...userDefinitions };
                          let currDefElement: any[] = newDef[propName];
                          if (currDefElement) {
                            const set = new Set(currDefElement);
                            if (_checked) set.add(val);
                            else set.delete(val);
                            newDef[propName] = Array.from(set.values());
                          }
                          setUserDefinitions(newDef);
                        }}
                      />
                    );
                  })}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
