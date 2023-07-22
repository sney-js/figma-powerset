import React, { useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import { Button, Input, Label, Text, Title } from 'react-figma-plugin-ds';
import { ComponentGroup, PSMessage, PSMessage_Component } from '../../models/Messages';
import { RandomGen } from '../utils/Random';
import { VariantDefinitions } from './VariantDefinitions';

function App() {
  const [variantDefinitions, setVariantDefinitions] = useState<ComponentPropertyDefinitions>();

  const onCreate = () => {
    let data: ComponentGroup = [
      {
        group: 'Text',
        items: [
          {
            ['Kind']: 'Secondary',
            ['Text#2:16']: new RandomGen(12).randWord(),
          },
          {
            ['Kind']: 'Secondary',
            ['Text#2:16']: new RandomGen(12).randWord(),
          },
          {
            ['Text#2:16']: new RandomGen(12).randWord(),
          },
          {
            ['Text#2:16']: new RandomGen(12).randWord(),
          },
          {
            ['Text#2:16']: new RandomGen(12).randSentence(),
          },
        ],
      },
      {
        group: 'Kind',
        items: [
          {
            ['Kind']: 'Secondary',
            ['Text#2:16']: new RandomGen(12).randWord(),
          },
          {
            ['Kind']: 'Secondary',
            ['Text#2:16']: new RandomGen(12).randWord(),
          },
        ],
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

  React.useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const { type, data } = event.data.pluginMessage as PSMessage;
      console.log('received msg1!', type);
      switch (type) {
        case 'complete':
          console.log(`Figma Says: ${data}`);
          break;
        case 'properties-list':
          console.log(data, 'data');
          setVariantDefinitions(data);
          break;
      }
    };
  }, []);

  return (
    <div className={'container'}>
      <Title level="h1" size="xlarge" weight="bold">
        The Powerset
      </Title>
      <VariantDefinitions definitions={variantDefinitions} />
      <div className={'sticky'}>
        <div className={'flex-between'}>
          <div className={'flex-grow'}>
          <Text>Total Variations: 56</Text>
          </div>
          <Button onClick={onCreate}>Create</Button>
          <Button isSecondary onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
