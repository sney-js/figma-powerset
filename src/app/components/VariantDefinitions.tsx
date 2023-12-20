import React, { useEffect, useState } from 'react';
import { Checkbox, Label, Text } from 'react-figma-plugin-ds';
import { generatePropCombinations } from '../utils/Random';
import {
  PSComponentPropertyDefinitions,
  VariantDefPropsList,
  VariantProps,
} from '../../models/Messages';
import { sendPluginMessage } from '../utils/utils';

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
            <th style={{ width: '35%' }}>
              <Label>Properties</Label>
            </th>
            <th style={{ width: '60%' }}>
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
                <Text className={'pl-xxsmall pr-xxsmall'}>{propName.split('#')[0]}</Text>
              </td>
              <td>
                <div className={''} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {masterDefinitions[propName].map((val, j) => {
                    const masterDefValue = definitions[propName];
                    let classes = ['flex-grow'];
                    let label, instanceID;
                    let defaultChecked = false;
                    if (userDefinitions) {
                      defaultChecked = userDefinitions[propName]?.some(
                        (userVal) => userVal === val
                      );
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
                        break;
                      case 'INSTANCE_SWAP':
                        label = '◇ ' + masterDefValue.instanceData[j]?.name;
                        instanceID = masterDefValue.instanceData[j]?.id;
                        break;
                    }

                    classes = classes.filter(Boolean);
                    return (
                      <div className={'flex flex-between'}>
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
                        {instanceID && (
                          <span
                            onClick={() => {
                              sendPluginMessage({
                                type: 'focus-id',
                                data: instanceID,
                              });
                            }}
                            className={'mr-xxsmall'}
                            style={{ color: 'var(--grey-40)' }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8.5 3.02469V1.5H7.5V3.02469C5.13779 3.25922 3.25922 5.13779 3.02469 7.5H1.5V8.5H3.02469C3.25922 10.8622 5.13779 12.7408 7.5 12.9753V14.5H8.5V12.9753C10.8622 12.7408 12.7408 10.8622 12.9753 8.5H14.5V7.5H12.9753C12.7408 5.13779 10.8622 3.25922 8.5 3.02469ZM7.5 4.03095V6.5H8.5V4.03095C10.3094 4.25657 11.7434 5.69064 11.9691 7.5H9.5V8.5H11.9691C11.7434 10.3094 10.3094 11.7434 8.5 11.9691V9.5H7.5V11.9691C5.69064 11.7434 4.25657 10.3094 4.03095 8.5H6.5V7.5H4.03095C4.25657 5.69064 5.69064 4.25657 7.5 4.03095Z"
                                fill="currentcolor"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
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
