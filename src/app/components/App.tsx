import React, { useEffect, useMemo, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import { Button, Label, Text, Tip, Title } from 'react-figma-plugin-ds';
import {
  ComponentGroup,
  PSMessage,
  PSMessage_Component,
  PSMessage_Definition,
  VariantOptionType,
  VariantProps,
} from '../../models/Messages';
import { generatePropCombinations, RandomGen } from '../utils/Random';
import { VariantDefinitions } from './VariantDefinitions';

function App() {
  const [variantDefinitions, setVariantDefinitions] = useState<ComponentPropertyDefinitions>();
  const [userSettings, setUserSettings] = useState<{ name; isVariant }>({
    name: 'N/A',
    isVariant: false,
  });
  const [powerset, setPowerset] = useState<Array<VariantProps>>();

  const onCreate = () => {
    console.log(powerset, 'powerset');
    let data: ComponentGroup = [
      {
        group: 'Text',
        items: powerset,
      },
    ];
    parent.postMessage(
      {
        pluginMessage: {
          type: 'create-group',
          data: data,
        } satisfies PSMessage_Component,
      },
      '*'
    );
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
  };

  useEffect(() => {
    window.onmessage = (event) => {
      const { type, data } = event.data.pluginMessage as PSMessage;
      console.log('received msg1!', type);
      switch (type) {
        case 'complete':
          break;
        case 'properties-list': {
          const dData = data satisfies PSMessage_Definition['data'];
          let instanceInfo = { name: dData.name, isVariant: false };
          if (dData.variants) {
            instanceInfo.isVariant = true;
            setVariantDefinitions(dData.variants);
          }
          setUserSettings(instanceInfo);
          break;
        }
      }
    };
  }, []);

  return (
    <div className={'container'}>
      <Title level="h1" size="xlarge" weight="bold">
        {userSettings.name}
      </Title>
      <Tip
        iconColor={userSettings.isVariant ? 'green' : 'red'}
        iconName={userSettings.isVariant ? 'check' : 'warning'}
      >
        {userSettings.isVariant ? 'This is a variant' : 'Please select instance of a component.'}
      </Tip>
      <VariantDefinitions
        definitions={variantDefinitions}
        onUserSelect={(data) => setPowerset(data)}
      />
      <div className={'sticky'}>
        <div className={'flex-between'}>
          <div className={'flex-grow'}>
            <Text>Total Variations: {powerset?.length || 0}</Text>
          </div>
          <Button isDisabled={!userSettings?.isVariant} onClick={onCreate}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
export default App;
