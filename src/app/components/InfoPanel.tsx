import React from 'react';
import { Tip } from 'react-figma-plugin-ds';
import { PSComponentPropertyDefinitions } from '../../models/Messages';

export function InfoPanel(props: {
  isVariant: boolean;
  compDefinitions: PSComponentPropertyDefinitions;
}) {
  const doesNotHaveProperties =
    props.isVariant &&
    (!props.compDefinitions || Object.keys(props.compDefinitions).length === 0);

  return (
    <div>
      {!props.isVariant && (
        <Tip
          className={'mb-xsmall type--small text--grey-100'}
          iconColor={'red'}
          iconName={'warning'}
        >
          Please select an instance of a component.
        </Tip>
      )}
      {doesNotHaveProperties && (
        <Tip
          className={'mb-xsmall type--small'}
          iconColor={'yellow'}
          iconName={'warning'}
        >
          This component has no properties.
        </Tip>
      )}
    </div>
  );
}
