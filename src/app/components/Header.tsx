import React, { useEffect, useState } from 'react';
import { Icon, Title } from 'react-figma-plugin-ds';
import { sendPluginMessage, truncate } from '../utils/utils';

export function Header(props: { name: string | null; isVariant: boolean }) {
  const { name, isVariant } = props;
  const [lockSelection, setLockSelection] = useState(false);
  const [minimiseUI, setMinimiseUI] = useState(false);

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
          <div title={'Minimise Plugin'}>
            <Icon
              name={!minimiseUI ? 'minus' : 'plus'}
              isSelected={false}
              onClick={() => {
                setMinimiseUI(!minimiseUI);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
