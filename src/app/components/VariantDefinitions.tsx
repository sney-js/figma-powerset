import React, { useEffect, useState } from 'react';
import { Checkbox, Label, Text } from 'react-figma-plugin-ds';
import {
  PSComponentPropertyDefinitions,
  PSComponentPropertyItemInstanceData,
  VariantDefPropsList,
  VariantDefType,
} from '../../models/Messages';
import { sortPropsOfCompPropDef } from '../../models/Utils';
import { arrValue } from '../../plugin/Utils';
import { IconDependency } from './elements/Icons';
import { VariantSelector } from './VariantSelector';

type VariantDefinitionsParams = {
  readonly compDefinitions: PSComponentPropertyDefinitions;
  infoData: { name: string; id: string };
  onUserSelect: (userSelections: VariantDefPropsList) => void;
  enable?: boolean;
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
  const sortedProps =
    sortPropsOfCompPropDef(definitions) || Object.keys(definitions);
  sortedProps.forEach((key) => {
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
  return uiDef;
}

export function VariantDefinitions(props: VariantDefinitionsParams) {
  const { compDefinitions, infoData, onUserSelect, enable = true } = props;

  const [uiDefinitions, setUiDefinitions] = useState<VariantDefPropsList>();
  const [userDefinitions, setUserDefinitions] = useState<VariantDefPropsList>();

  useEffect(() => {
    if (!compDefinitions) return;
    const uiDef = createUIVariantDefinitions(compDefinitions);
    // if (JSON.stringify(uiDef) !== JSON.stringify(uiDefinitions || {})) {}
    const userDefDefault: VariantDefPropsList = {};
    Object.keys(uiDef).forEach((key) => {
      userDefDefault[key] = [compDefinitions[key]?.defaultValue];
    });
    setUiDefinitions(uiDef);
    setUserDefinitions(userDefDefault);
  }, [compDefinitions]);

  useEffect(() => {
    if (userDefinitions) {
      onUserSelect(userDefinitions);
    }
  }, [userDefinitions]);

  if (!uiDefinitions) return null;

  return (
    <div>
      <table className={'table'}>
        <thead>
          <tr>
            <th style={{ width: '30px' }}>
              <Label>#</Label>
            </th>
            <th style={{ width: '275px' }}>
              <Label>Properties</Label>
            </th>
            <th style={{ width: '58%' }}>
              <Checkbox
                className={`flex-grow`}
                label={'All Values'}
                name={[infoData.id, 'all-values'].join('.')}
                defaultValue={false}
                isDisabled={!enable}
                onChange={(_checked) => {
                  let newDef = { ...userDefinitions };
                  if (_checked) {
                    newDef = { ...uiDefinitions };
                  } else {
                    Object.keys(newDef).forEach((key) => {
                      newDef[key] = [];
                    });
                  }
                  setUserDefinitions(newDef);
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(uiDefinitions).map((propName, i) => (
            <tr key={propName + i}>
              <td>
                <Label>{i + 1}.</Label>
              </td>
              <td>
                <div className={'p-xxsmall'}>
                  <Text className={'m-0'}>{propName.split('#')[0]}</Text>
                  {arrValue(compDefinitions[propName].disabledByProperty) ? (
                    <Text className={'m-0 pt-xxxsmall text--grey-20'}>
                      <IconDependency />{' '}
                      {compDefinitions[propName].disabledByProperty
                        ?.map((s) => s.split('#')[0])
                        .join(',')}
                    </Text>
                  ) : null}
                </div>
              </td>
              <td>
                <div className={'table_variant-selector_item'}>
                  {uiDefinitions[propName].map((propValue: VariantDefType) => {
                    let defaultChecked = false;
                    if (userDefinitions) {
                      defaultChecked = userDefinitions[propName]?.some(
                        (userVal) => userVal === propValue
                      );
                    }
                    let varDef = compDefinitions[propName];
                    let disabledProps = varDef.disabledByProperty || [];
                    let isEnabled =
                      !arrValue(disabledProps) ||
                      disabledProps.every((pr) => {
                        const [propName, propValue = true] = pr.split('=');
                        return userDefinitions[propName].find(
                          (v) => v === propValue
                        );
                      });
                    if (isEnabled && !enable) isEnabled = enable;
                    return (
                      <VariantSelector
                        propName={propName}
                        propValue={propValue}
                        defaultChecked={defaultChecked}
                        definitionOptions={varDef}
                        disabled={!isEnabled}
                        key={[
                          propName,
                          propValue,
                          infoData.id,
                          defaultChecked,
                        ].join('-')}
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
