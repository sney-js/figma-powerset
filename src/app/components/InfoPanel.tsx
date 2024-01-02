import React from 'react';
import { Disclosure, Tip } from 'react-figma-plugin-ds';
import { PSComponentPropertyDefinitions } from '../../models/Messages';
import { cssVars } from '../utils/utils';

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
    </div>
  );
}
