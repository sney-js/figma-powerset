import React, { useEffect, useLayoutEffect, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import { Disclosure, Icon, Label } from 'react-figma-plugin-ds';
import {
  ComponentGroup,
  PSMessage,
  PSMessage_Create,
  PSMessage_Definition,
  VariantDefPropsList,
  VariantProps,
} from '../../models/Messages';
import { generatePowerset } from '../utils/Combinatrics';
import { sendPluginMessage } from '../utils/utils';
import { Footer } from './Footer';
import { Header } from './Header';
import { InfoPanel } from './InfoPanel';
import { VariantDefinitions } from './VariantDefinitions';

const flattenUserSelection = (
  userSelections: Record<string, VariantDefPropsList>,
  mainKey: string
): VariantDefPropsList => {
  let allSelections: VariantDefPropsList = {};
  for (const propKey in userSelections) {
    for (const prop in userSelections[propKey]) {
      let propName = prop;
      if (propKey !== mainKey) {
        propName = propKey + '///' + prop;
      }
      allSelections[propName] = userSelections[propKey][prop];
    }
  }
  return allSelections;
};

function formatExposedInstances(
  powerset: Array<VariantProps>
): ComponentGroup[number]['items'] {
  const responseData: ComponentGroup[number]['items'] = [...powerset];
  for (let i = 0; i < responseData.length; i++) {
    responseData[i].__exposedInstances = {};
    for (const prop in responseData[i]) {
      let val = prop.split('///');
      if (val[1]) {
        let exposedInstanceItem = responseData[i].__exposedInstances[val[0]];

        if (!exposedInstanceItem)
          responseData[i].__exposedInstances[val[0]] = {};
        responseData[i].__exposedInstances[val[0]][val[1]] =
          responseData[i][prop];
        delete responseData[i][prop];
      }
    }
  }
  return responseData;
}

function App() {
  let instanceInfoInitialState = {
    name: null,
    id: null,
    isVariant: false,
    variants: null,
    exposedInstances: [],
  };
  const [instanceInfo, setInstanceInfo] = useState<
    PSMessage_Definition['data']
  >(instanceInfoInitialState);

  const [userSelections, setUserSelections] =
    useState<Record<string, VariantDefPropsList>>(null);

  const [powerset, setPowerset] = useState<Array<VariantProps>>();

  useLayoutEffect(() => {
    const handlePluginMessage = (pluginMessage: PSMessage) => {
      const { type, data } = pluginMessage;
      switch (type) {
        case 'properties-list': {
          console.log(data, 'data');
          setInstanceInfo(data);
          break;
        }
      }
    };
    window.addEventListener('message', (event) =>
      handlePluginMessage(event.data.pluginMessage)
    );
    return () => {
      window.removeEventListener('message', () => {});
    };
  }, []);

  useEffect(() => setUserSelections(null), [instanceInfo]);

  useEffect(() => {
    if (!userSelections) return;
    let allSelections = flattenUserSelection(userSelections, instanceInfo.id);
    const pwrSet = generatePowerset(allSelections);
    setPowerset(pwrSet);
  }, [userSelections]);

  const { variants, name, exposedInstances, id, isVariant } = instanceInfo;
  return (
    <div className={'container'}>
      <Header name={name} isVariant={isVariant} />
      <InfoPanel isVariant={isVariant} compDefinitions={variants} />

      <div>
        {name && (
          <div
            className={'flex flex-between gap-1 sticky-exposed-instances-title'}
          >
            <Label>{`◇ ` + name}</Label>
            {exposedInstances.length ? (
              <Label className={'justify-content-end'}>
                {1 + ' / ' + (exposedInstances.length + 1)}
              </Label>
            ) : null}
          </div>
        )}
        <VariantDefinitions
          key={'table-' + id}
          compDefinitions={variants}
          infoData={{ name: name, id: id }}
          onUserSelect={(data: VariantDefPropsList) => {
            const curr = userSelections ? { ...userSelections } : {};
            curr[id] = data;
            setUserSelections(curr);
          }}
        />
      </div>
      {exposedInstances.length > 0 && (
        <div
          className={
            'sticky-exposed-instances type type--bold flex justify-content-between'
          }
        >
          <span>{`Exposed Instances (${exposedInstances.length})`}</span>
          <span>↓</span>
        </div>
      )}
      {exposedInstances.length > 0 && (
        <div>
          {exposedInstances.map((def, i) => (
            <div className={i > 0 ? `pt-small` : ''}>
              <div
                className={
                  'flex flex-between gap-1 sticky-exposed-instances-title'
                }
              >
                <Label>{`◇ ` + def.name}</Label>
                <Label className={'justify-content-end'}>
                  {i + 2 + ' / ' + (exposedInstances.length + 1)}
                </Label>
              </div>
              <VariantDefinitions
                key={'table-' + def.id}
                compDefinitions={def.variants}
                infoData={{ name: def.name, id: def.id }}
                onUserSelect={(data: VariantDefPropsList) => {
                  const curr = userSelections ? { ...userSelections } : {};
                  curr[def.id] = data;
                  setUserSelections(curr);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <Footer
        powerset={powerset}
        disabled={!(isVariant && powerset?.length)}
        onClick={() => {
          let responseData = exposedInstances.length
            ? formatExposedInstances(powerset)
            : powerset;
          const pluginMessage: PSMessage_Create = {
            type: 'create-group',
            data: [{ group: name, items: responseData }],
          };
          sendPluginMessage(pluginMessage);
        }}
      />
    </div>
  );
}

export default App;
