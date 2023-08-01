import React, { useEffect, useState } from 'react';
import { Checkbox, Label, Text } from 'react-figma-plugin-ds';
import { generatePropCombinations } from '../utils/Random';
import {
  PSComponentPropertyDefinitions,
  VariantDefPropsList,
  VariantProps,
} from '../../models/Messages';

type VariantDefinitionsParams = {
  definitions: PSComponentPropertyDefinitions;
  selectionData: { name: string; id: string };
  onUserSelect: (powerset: VariantProps[]) => void;
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
  const { definitions, selectionData, onUserSelect } = props;

  const [masterDefinitions, setMasterDefinitions] = useState<VariantDefPropsList>();
  const [userDefinitions, setUserDefinitions] = useState<VariantDefPropsList>();

  useEffect(() => {
    if (!definitions) return;
    const masterDef: VariantDefPropsList = {};
    Object.keys(definitions).forEach((key) => {
      const val = definitions[key];
      switch (val.type) {
        case 'BOOLEAN':
          masterDef[key] = [true, false];
          break;
        case 'TEXT':
          masterDef[key] = [
            val.defaultValue,
            TextHelperList[0][1],
            TextHelperList[1][1],
            TextHelperList[2][1],
          ];
          break;
        case 'VARIANT':
          masterDef[key] = val.variantOptions;
          break;
        case 'INSTANCE_SWAP':
          masterDef[key] = val.instanceData.map((c) => c.id).filter(Boolean);
          break;
      }
    });
    // if (JSON.stringify(masterDef) !== JSON.stringify(masterDefinitions || {})) {
    setMasterDefinitions(masterDef);
    const userDefDefault: VariantDefPropsList = {};
    Object.keys(masterDef).forEach((key) => {
      userDefDefault[key] = [definitions[key].defaultValue];
    });
    setUserDefinitions(userDefDefault);
    // }
  }, [definitions]);

  useEffect(() => {
    if (userDefinitions) {
      onUserSelect(generatePropCombinations(userDefinitions));
    }
  }, [userDefinitions]);

  if (!masterDefinitions) return null;

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
          {Object.keys(masterDefinitions).map((propName, i) => (
            <tr key={propName + i}>
              <td>
                <Label>{i + 1}.</Label>
              </td>
              <td>
                <Text className={'pl-xxsmall'}>{propName.split('#')[0]}</Text>
              </td>
              <td>
                {masterDefinitions[propName].map((val, j) => {
                  const masterDefValue = definitions[propName];
                  let classes = [];
                  let label;
                  let defaultChecked = false;
                  if (userDefinitions) {
                    defaultChecked = userDefinitions[propName]?.some((userVal) => userVal === val);
                  }
                  switch (masterDefValue?.type) {
                    case 'BOOLEAN':
                      label = String(Boolean(val));
                      break;
                    case 'VARIANT':
                      label = String(val);
                      break;
                    case 'TEXT':
                      const prettyName = TextHelperList.find((x) => x[1] === val);

                      if (prettyName) {
                        label = prettyName[0] + '...';
                        classes.push('italics');
                      } else {
                        label = `'${val}'`;
                      }
                      classes = classes.filter(Boolean);
                      break;
                    case 'INSTANCE_SWAP':
                      label = '◇ ' + masterDefValue.instanceData[j]?.name;
                      break;
                  }
                  return (
                    <Checkbox
                      className={classes.join(' ')}
                      label={label}
                      key={[propName, val, selectionData.id].join('-')}
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
