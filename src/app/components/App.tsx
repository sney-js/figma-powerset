import React, { useEffect, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import { Button, Disclosure, Text, Tip, Title } from 'react-figma-plugin-ds';
import {
  ComponentGroup,
  PSMessage,
  PSMessage_Component,
  PSMessage_Definition,
  VariantProps,
} from '../../models/Messages';
import { VariantDefinitions } from './VariantDefinitions';
import { cssVars } from '../utils/utils';

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

  let canCreate: boolean = !(userSettings.isVariant && powerset?.length);
  return (
    <div className={'container'}>
      {userSettings.isVariant ? (
        <Title level="h1" size="xlarge" weight="bold">
          {userSettings.name}
        </Title>
      ) : (
        <Tip className={'mb-xsmall'} iconColor={'red'} iconName={'warning'}>
          Please select an instance of a component.
        </Tip>
      )}
      {userSettings.isVariant && !powerset?.length && (
        <Tip className={'mb-xsmall'} iconColor={'yellow'} iconName={'warning'}>
          This component has no properties.
        </Tip>
      )}
      <div style={cssVars({ '--line-height': '1.5' })} className={'mb-xsmall'}>
        <Disclosure label="How does it work?" isSection>
          Powerset calculates every possible combination of a component based on the properties it
          has and their options.
          <br />
          <br />
          Select an instance of a component within any page. Then use the checkboxes below to select
          the desired values for additional component variations. Powerset will render all
          permutations of the properties and their values in a new frame.
          <br />
          <br />A new frame is created with name 'Powerset-$ComponentName'. This will be updated
          every time the plugin is run. Any changes to the dimensions of this frame will be
          maintained.
          <br />
          <br />* – extra example values provided by this plugin for you to try.
        </Disclosure>
      </div>
      <VariantDefinitions
        definitions={variantDefinitions}
        onUserSelect={(data) => setPowerset(data)}
      />
      <div className={'sticky'}>
        <div className={'flex-between'}>
          <div className={'flex-grow'}>
            <Text>Total Variations: {powerset?.length || 0}</Text>
          </div>
          <Button isDisabled={canCreate} onClick={onCreate}>
            Create Powerset
          </Button>
        </div>
      </div>
    </div>
  );
}
export default App;
