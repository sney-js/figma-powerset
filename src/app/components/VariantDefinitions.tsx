import React, { useEffect, useState } from 'react';
import { Label, Text } from 'react-figma-plugin-ds';
import { VariantSelector } from './VariantSelector';
import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyItemInstanceData,
  VariantDefPropsList,
  VariantDefType,
  VariantProps,
} from '../../models/Messages';
import { sendPluginMessage, truncate } from '../utils/utils';

type VariantDefinitionsParams = {
  readonly compDefinitions: PSComponentPropertyDefinitions;
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

function createUIVariantDefinitions(
  definitions: PSComponentPropertyDefinitions
): VariantDefPropsList {
  const uiDef: VariantDefPropsList = {};
  Object.keys(definitions).forEach((key) => {
    const val = definitions[key];
    switch (val.type) {
      case 'BOOLEAN':
        uiDef[key] = [true, false];
        break;
      case 'TEXT':
        uiDef[key] = [
          val.defaultValue,
          TextHelperList[0][1],
          TextHelperList[1][1],
          TextHelperList[2][1],
        ];
        break;
      case 'VARIANT':
        uiDef[key] = val.variantOptions;
        break;
      case 'INSTANCE_SWAP':
        uiDef[key] = (val as PSComponentPropertyItemInstanceData).instanceData
          .map((c) => c.id)
          .filter(Boolean);
        break;
    }
  });

  console.log(uiDef, 'uiDef');
  return uiDef;
}

export function VariantDefinitions(props: VariantDefinitionsParams) {
  const { compDefinitions, selectionData, onUserSelect } = props;

  const [UIDefinitions, setUIDefinitions] = useState<VariantDefPropsList>();
  const [userDefinitions, setUserDefinitions] = useState<VariantDefPropsList>();

  useEffect(() => {
    if (!compDefinitions) return;
    const uiDef = createUIVariantDefinitions(compDefinitions);
    // if (JSON.stringify(uiDef) !== JSON.stringify(UIDefinitions || {})) {}
    const userDefDefault: VariantDefPropsList = {};
    Object.keys(uiDef).forEach((key) => {
      userDefDefault[key] = [compDefinitions[key]?.defaultValue];
    });
    setUIDefinitions(uiDef);
    setUserDefinitions(userDefDefault);
  }, [compDefinitions]);

  useEffect(() => {
    if (userDefinitions) {
      console.log(userDefinitions, 'userDefinitions');
      setTimeout(()=>{
        let powerset = generatePropCombinations(userDefinitions);
        onUserSelect(powerset);
      },50);
    }
  }, [userDefinitions]);

  if (!UIDefinitions) return null;

  return (
    <div>
      <table className={'table'}>
        <thead>
          <tr>
            <th style={{ width: '30px' }}>
              <Label>#</Label>
            </th>
            <th style={{ width: '35%' }}>
              <Label>Properties</Label>
            </th>
            <th style={{ width: '60%' }}>
              <Label>Values</Label>
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(UIDefinitions).map((propName, i) => (
            <tr key={propName + i}>
              <td>
                <Label>{i + 1}.</Label>
              </td>
              <td>
                <Text className={'pl-xxsmall pr-xxsmall'}>{propName.split('#')[0]}</Text>
              </td>
              <td>
                <div className={''} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {UIDefinitions[propName].map((propValue: VariantDefType) => {
                    let defaultChecked = false;
                    if (userDefinitions) {
                      defaultChecked = userDefinitions[propName]?.some(
                        (userVal) => userVal === propValue
                      );
                    }
                    return (
                      <VariantSelector
                        propName={propName}
                        propValue={propValue}
                        defaultChecked={defaultChecked}
                        definitionOptions={compDefinitions[propName]}
                        key={[propName, propValue, selectionData.id].join('-')}
                        onChange={(_checked) => {
                          let newDef = { ...userDefinitions };
                          let currDefElement: any[] = newDef[propName];
                          if (currDefElement) {
                            const set = new Set(currDefElement);
                            if (_checked) set.add(propValue);
                            else set.delete(propValue);
                            newDef[propName] = Array.from(set.values());
                          }
                          setUserDefinitions(newDef);
                        }}
                      />
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
