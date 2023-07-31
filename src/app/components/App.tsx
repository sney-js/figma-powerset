import React, { useEffect, useLayoutEffect, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import { Button, Disclosure, Icon, Text, Tip, Title } from 'react-figma-plugin-ds';
import {
  PSMessage,
  PSMessage_Create,
  PSMessage_Definition,
  VariantProps,
} from '../../models/Messages';
import { VariantDefinitions } from './VariantDefinitions';
import { cssVars } from '../utils/utils';

function sendPluginMessage(pluginMessage: PSMessage) {
  window.parent.postMessage({ pluginMessage }, '*');
}

function App() {
  const [variantSelection, setVariantSelection] = useState<PSMessage_Definition['data']>({
    name: null,
    id: null,
    isVariant: false,
    variants: null,
  });
  const [powerset, setPowerset] = useState<Array<VariantProps>>();
  const [lockSelection, setLockSelection] = useState(false);

  useLayoutEffect(() => {
    const handlePluginMessage = (pluginMessage: PSMessage) => {
      const { type, data } = pluginMessage;
      switch (type) {
        case 'properties-list': {
          setVariantSelection(data);
          break;
        }
      }
    };
    window.addEventListener('message', (event) => handlePluginMessage(event.data.pluginMessage));
    return () => {
      window.removeEventListener('message', () => {});
    };
  }, []);

  useEffect(() => {
    sendPluginMessage({
      type: 'lock-selection',
      data: {
        lock: lockSelection,
      },
    });
  }, [lockSelection]);

  let canCreate: boolean = !(variantSelection.isVariant && powerset?.length);
  return (
    <div className={'container'}>
      <div className={'sticky top-0'}>
        <div className={'flex-between border-bottom-grey-10 pl-xxsmall pr-xsmall'}>
          <Title level="h1" size="xlarge" weight="bold">
            {variantSelection.isVariant ? `◇ ` : ''}
            {variantSelection.name?.replace(/(.{30})..+/, "$1…")}
          </Title>
          <div className={'flex gap-1'}>
            <Icon
              className={!variantSelection.isVariant ? 'pointer-none' : ''}
              isDisabled={!variantSelection.isVariant}
              name={'visible'}
              onClick={() => {
                sendPluginMessage({ type: 'target' });
              }}
            />
            <Icon
              className={!variantSelection.isVariant ? 'pointer-none' : ''}
              isDisabled={!variantSelection.isVariant}
              name={!lockSelection ? 'lock-off' : 'lock-on'}
              isSelected={lockSelection}
              onClick={() => {
                setLockSelection(!lockSelection);
              }}
            />
          </div>
        </div>
      </div>
      {!variantSelection.isVariant && (
        <Tip className={'mb-xsmall type--small'} iconColor={'red'} iconName={'warning'}>
          Please select an instance of a component.
        </Tip>
      )}
      {variantSelection.isVariant && !powerset?.length && (
        <Tip className={'mb-xsmall type--small'} iconColor={'yellow'} iconName={'warning'}>
          This component has no properties.
        </Tip>
      )}
      <div style={cssVars({ '--line-height': '1.5' })} className={'mb-xsmall'}>
        <Disclosure label="How does it work?" isSection>
          Powerset calculates and renders every possible combination of a component based on its
          properties and your selections.
          <br />
          <Text weight={'bold'}>Select an instance of a component within any page.</Text>
          Then use the checkboxes below to select the desired values for each additional variation
          combination. Powerset will render all permutations of the properties and their values in a
          new frame.
          <br />
          <ul>
            <li>
              <b>FrameName</b> – The new frame is created with name 'Powerset/$ComponentName'. This
              will be updated for each component set every time the plugin is run. Any changes to
              the properties of this frame will be maintained. Feel free to rename the frame for new
              frames.
            </li>
            <br />
            <li>
              <b>Lock</b> – Every time you select a node, this plugin will recalculate its variance
              permutations. Toggle the lock icon to allow you to play with the locked selection.
            </li>
          </ul>
        </Disclosure>
      </div>
      <VariantDefinitions
        key={'table-' + variantSelection.id}
        definitions={variantSelection.variants}
        onUserSelect={(data) => setPowerset(data)}
      />
      <div className={'sticky p-xxsmall pl-xsmall pr-xsmall bottom-0 border-top-grey-10'}>
        <div className={'flex-between'}>
          <div className={'flex-grow'}>
            <Text>Total Variations: {powerset?.length || 0}</Text>
          </div>
          <Button
            isDisabled={canCreate}
            onClick={() => {
              const pluginMessage: PSMessage_Create = {
                type: 'create-group',
                data: [{ group: 'Text', items: powerset }],
              };
              sendPluginMessage(pluginMessage);
            }}
          >
            Create Powerset
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
