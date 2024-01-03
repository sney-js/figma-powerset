import React, { useEffect, useState } from 'react';
import { Icon, Title } from 'react-figma-plugin-ds';
import { sendPluginMessage, truncate } from '../utils/utils';

export function Header(props: { name: string | null; isVariant: boolean }) {
  const { name, isVariant } = props;
  const [lockSelection, setLockSelection] = useState(false);
  const [minimiseUI, setMinimiseUI] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(
    () =>
      sendPluginMessage({
        type: 'lock-selection',
        data: {
          lock: lockSelection,
        },
      }),
    [lockSelection]
  );

  useEffect(
    () =>
      sendPluginMessage({
        type: 'minimise-ui',
        data: {
          minimise: minimiseUI,
        },
      }),
    [minimiseUI]
  );

  return (
    <div>
      <div className={'sticky top-0'}>
        <div
          className={'flex-between border-bottom-grey-10 pl-xxsmall pr-xsmall'}
        >
          <Title level="h1" size="xlarge" weight="bold">
            {isVariant ? `◇ ` : ''}
            {truncate(name)}
          </Title>
          <div className={'flex gap-1'}>
            <div title={'Scroll to instance'}>
              <Icon
                className={!isVariant ? 'pointer-none' : ''}
                isDisabled={!isVariant}
                name={'instance'}
                onClick={() => {
                  sendPluginMessage({ type: 'target' });
                }}
              />
            </div>
            <div title={'Persist current properties'}>
              <Icon
                className={!isVariant ? 'pointer-none' : ''}
                isDisabled={!isVariant}
                name={!lockSelection ? 'lock-off' : 'lock-on'}
                isSelected={lockSelection}
                onClick={() => {
                  setLockSelection(!lockSelection);
                }}
              />
            </div>
            <div className={'divider'} />
            <div title={'Help'}>
              <Icon
                name={'ellipses'}
                text={'?'}
                isSelected={help}
                onClick={() => {
                  setHelp(!help);
                }}
              />
            </div>
            <div title={'Minimise Plugin'}>
              <Icon
                name={!minimiseUI ? 'minus' : 'plus'}
                isSelected={minimiseUI}
                onClick={() => {
                  window.scroll({top:0, behavior: 'smooth'});
                  setMinimiseUI(!minimiseUI);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {help && (
        <div className={'rich-text sticky p-small top-52 border-bottom-grey-10'}>
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
        </div>
      )}
    </div>
  );
}
