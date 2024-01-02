import React, { useLayoutEffect, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import { Button, Text } from 'react-figma-plugin-ds';
import {
  PSMessage,
  PSMessage_Create,
  PSMessage_Definition,
  VariantProps,
} from '../../models/Messages';
import { generateCombinations } from '../utils/Combinatrics';
import { sendPluginMessage } from '../utils/utils';
import { Header } from './Header';
import { InfoPanel } from './InfoPanel';
import { VariantDefinitions } from './VariantDefinitions';

function Footer(props: {
  powerset: Array<VariantProps>;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={
        'sticky p-xxsmall pl-xsmall pr-xsmall bottom-0 border-top-grey-10'
      }
    >
      <div className={'flex-between'}>
        <div className={'flex-grow'}>
          <Text>Total Variations: {props.powerset?.length || 0}</Text>
        </div>
        <Button isDisabled={props.disabled} onClick={props.onClick}>
          Create Powerset
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [instanceInfo, setInstanceInfo] = useState<
    PSMessage_Definition['data']
  >({
    name: null,
    id: null,
    isVariant: false,
    variants: null,
    exposedInstances: [],
  });
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

  const { variants, name, exposedInstances, id, isVariant } = instanceInfo;

  return (
    <div className={'container'}>
      <Header name={name} isVariant={isVariant} />
      <InfoPanel isVariant={isVariant} compDefinitions={variants} />

      <VariantDefinitions
        key={'table-' + id}
        compDefinitions={variants}
        infoData={{ name: name, id: id }}
        onUserSelect={(data) => {
          const powerset = generateCombinations(data, Object.keys(data));
          setPowerset(powerset);
        }}
      />
      {exposedInstances.map((def) => (
        <VariantDefinitions
          key={'table-' + def.id}
          compDefinitions={def.variants}
          infoData={{ name: def.name, id: def.id }}
          onUserSelect={(_data) => {
            // const powerset = generateCombinations(data, Object.keys(data));
            // setPowerset(powerset);
          }}
        />
      ))}

      <Footer
        powerset={powerset}
        disabled={!(isVariant && powerset?.length)}
        onClick={() => {
          const pluginMessage: PSMessage_Create = {
            type: 'create-group',
            data: [{ group: name, items: powerset }],
          };
          sendPluginMessage(pluginMessage);
        }}
      />
    </div>
  );
}

export default App;
