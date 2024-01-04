import React from 'react';
import { Checkbox } from 'react-figma-plugin-ds';
import {
  PSComponentPropertyItemInstanceData,
  PSComponentPropertyItems,
  VariantDefType,
} from '../../models/Messages';
import { sendPluginMessage, truncate } from '../utils/utils';

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
  onChange: (_checked: boolean) => void; // with actual type
};

export const VariantSelector: React.FC<NewComponentProps> = ({
  propName,
  propValue,
  defaultChecked,
  definitionOptions,
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
          name={[propName, propValue].join('.')}
          defaultValue={defaultChecked}
          onChange={onChange}
        />
      ) : null}
      {/*{definitionOptions.type === 'INSTANCE_SWAP' && (*/}
      {/*  <span*/}
      {/*    onClick={() => {*/}
      {/*      sendPluginMessage({*/}
      {/*        type: 'focus-id',*/}
      {/*        data: instanceID,*/}
      {/*      });*/}
      {/*    }}*/}
      {/*    className={'mr-xxsmall'}*/}
      {/*    style={{ color: 'var(--grey-40)' }}*/}
      {/*  >*/}
      {/*    <IconInstance />*/}
      {/*  </span>*/}
      {/*)}*/}
    </div>
  );
};

function IconInstance() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 3.02469V1.5H7.5V3.02469C5.13779 3.25922 3.25922 5.13779 3.02469 7.5H1.5V8.5H3.02469C3.25922 10.8622 5.13779 12.7408 7.5 12.9753V14.5H8.5V12.9753C10.8622 12.7408 12.7408 10.8622 12.9753 8.5H14.5V7.5H12.9753C12.7408 5.13779 10.8622 3.25922 8.5 3.02469ZM7.5 4.03095V6.5H8.5V4.03095C10.3094 4.25657 11.7434 5.69064 11.9691 7.5H9.5V8.5H11.9691C11.7434 10.3094 10.3094 11.7434 8.5 11.9691V9.5H7.5V11.9691C5.69064 11.7434 4.25657 10.3094 4.03095 8.5H6.5V7.5H4.03095C4.25657 5.69064 5.69064 4.25657 7.5 4.03095Z"
        fill="currentcolor"
      />
    </svg>
  );
}
