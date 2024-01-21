import React from 'react';
import { Checkbox } from 'react-figma-plugin-ds';
import {
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
  VariantDefType,
} from '../../models/Messages';
import { truncate } from '../utils/utils';

const TextHelperList = [
  ['Words', 'Lorem ipsum dolor sit'],
  ['Sentence', 'Lorem ipsum dolor sit amet, consectetur adipisici elit.'],
  [
    'Paragraph',
    `Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. 
  
Gallia est omnis divisa in partes tres, quarum.
  
Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.`,
  ],
];

type NewComponentProps = {
  propName: string;
  propValue: VariantDefType;
  defaultChecked: boolean;
  definitionOptions: PSComponentPropertyItems;
  disabled?: boolean;
  onChange: (_checked: boolean) => void; // with actual type
};

export const VariantSelector: React.FC<NewComponentProps> = ({
  propName,
  propValue,
  defaultChecked,
  definitionOptions,
  disabled = false,
  onChange,
}) => {
  let classes = ['flex-grow'];
  let label, instanceID;
  switch (definitionOptions?.type) {
    case 'BOOLEAN':
      label = String(Boolean(propValue));
      break;
    case 'VARIANT':
      label = String(propValue);
      break;
    case 'TEXT':
      const prettyName = TextHelperList.find((x) => x[1] === propValue);

      if (prettyName) {
        label = prettyName[0] + '...';
        classes.push('italics');
      } else {
        label = `'${truncate(propValue as string, 27)}'`;
      }
      break;
    case 'INSTANCE_SWAP': {
      label =
        '◇ ' +
        (
          definitionOptions as PSComponentPropertyItemInstanceData
        ).instanceData.find((s) => s.id === propValue)?.name;
      break;
    }
  }

  label = truncate(label, 29);
  classes = classes.filter(Boolean);

  return (
    <div className={'flex flex-between'}>
      {label ? (
        <Checkbox
          className={classes.join(' ')}
          label={label}
          isDisabled={disabled}
          name={[propName, propValue].join('.')}
          defaultValue={defaultChecked}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
};

