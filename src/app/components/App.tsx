import React, { useEffect, useLayoutEffect, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import {
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
import { TableHeader } from './TableHeader';
import {
  createDependencies,
  flattenUserSelection,
  formatExposedInstances,
} from './utils/AppUtils';
import { VariantDefinitions } from './VariantDefinitions';

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
    console.log(userSelections, 'userSelections');
    const allSelections = flattenUserSelection(userSelections, instanceInfo.id);
    const dependencies = createDependencies(allSelections, exposedInstances);
    const pwrSet = generatePowerset(allSelections, dependencies);
    setPowerset(pwrSet);
  }, [userSelections]);

  const { variants, name, exposedInstances, id, isVariant } = instanceInfo;
  return (
    <div className={'container'}>
      <Header name={name} isVariant={isVariant} />
      <InfoPanel isVariant={isVariant} compDefinitions={variants} />

      <div>
        {name && isVariant && (
          <TableHeader
            name={name}
            total={exposedInstances.length + 1}
            currentIndex={1}
          />
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
              <TableHeader
                name={def.name}
                total={exposedInstances.length + 1}
                currentIndex={i + 2}
              />

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
          console.log(responseData, 'responseData');
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
