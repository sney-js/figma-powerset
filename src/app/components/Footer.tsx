import React from 'react';
import { Button, Text } from 'react-figma-plugin-ds';
import { VariantProps } from '../../models/Messages';

export function Footer(props: {
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
