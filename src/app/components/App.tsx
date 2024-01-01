import React, { useEffect, useLayoutEffect, useState } from 'react';
import '../styles/ui.css';
import 'react-figma-plugin-ds/figma-plugin-ds.css';
import {
  Button,
  Disclosure,
  Icon,
  Text,
  Tip,
  Title,
} from 'react-figma-plugin-ds';
import {
  PSMessage,
  PSMessage_Create,
  PSMessage_Definition,
  VariantProps,
} from '../../models/Messages';
import { generateCombinations } from '../utils/Combinatrics';
import { cssVars, sendPluginMessage, truncate } from '../utils/utils';
import { VariantDefinitions } from './VariantDefinitions';

function App() {
  const [variantSelection, setVariantSelection] = useState<
    PSMessage_Definition['data']
  >({
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
          console.log(data, 'data');
          setVariantSelection(data);
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
        <div
          className={'flex-between border-bottom-grey-10 pl-xxsmall pr-xsmall'}
        >
          <Title level="h1" size="xlarge" weight="bold">
            {variantSelection.isVariant ? `◇ ` : ''}
            {truncate(variantSelection.name)}
          </Title>
          <div className={'flex gap-1'}>
            <Icon
              className={!variantSelection.isVariant ? 'pointer-none' : ''}
              isDisabled={!variantSelection.isVariant}
              name={'instance'}
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
        <Tip
          className={'mb-xsmall type--small text--grey-100'}
          iconColor={'red'}
          iconName={'warning'}
        >
          Please select an instance of a component.
        </Tip>
      )}
      {variantSelection.isVariant && !powerset?.length && (
        <Tip
          className={'mb-xsmall type--small'}
          iconColor={'yellow'}
          iconName={'warning'}
        >
          This component has no properties.
        </Tip>
      )}
      <div style={cssVars({ '--line-height': '1.5' })} className={'mb-xsmall'}>
        <Disclosure label="How does it work?" isSection>
          Powerset renders all permutations of a selected instance based on the
          values of its variant properties. The created combinations can help
          you QA your component library definitions, or showcase its
          permutations.
          <br />
          <br />
          To start, select an instance of a component. Then use the checkboxes
          on the generated properties table to select all the desired values for
          each new variation combination.
          <br />
          <ul className={'pl-xsmall'}>
            <li>
              <b>FrameName</b> – A new frame is created with name
              'Powerset/$LayerName'. This will be updated for the same instance
              every time the plugin is run. Any changes to the auto-layout
              properties of this frame will be maintained on each run. Feel free
              to rename the frame to create new frames on next run.
            </li>
            <br />
            <li>
              <b>Lock</b> – Every time you select an instance, this plugin will
              regenerate its properties table. Toggle the lock icon to lock the
              properties table on the selected instance.
            </li>
          </ul>
        </Disclosure>
      </div>
      <VariantDefinitions
        key={'table-' + variantSelection.id}
        compDefinitions={variantSelection.variants}
        selectionData={{ name: variantSelection.name, id: variantSelection.id }}
        onUserSelect={(data) => {
          const powerset = generateCombinations(data, Object.keys(data));
          setPowerset(powerset);
        }}
      />
      <div
        className={
          'sticky p-xxsmall pl-xsmall pr-xsmall bottom-0 border-top-grey-10'
        }
      >
        <div className={'flex-between'}>
          <div className={'flex-grow'}>
            <Text>Total Variations: {powerset?.length || 0}</Text>
          </div>
          <Button
            isDisabled={canCreate}
            onClick={() => {
              const pluginMessage: PSMessage_Create = {
                type: 'create-group',
                data: [{ group: variantSelection.name, items: powerset }],
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
