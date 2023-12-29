export type PluginMessages =
  | 'create-group'
  | 'properties-list'
  | 'complete'
  | 'target'
  | 'focus-id'
  | 'lock-selection';

export type PSMessage = {
  type: PluginMessages;
  data?: any;
  message?: string;
};

export type PSInstanceSwapPreferredValue = {
  name: string;
  id: string;
};

type PSComponentPropertyItem = ComponentPropertyDefinitions[string];

export type PSComponentPropertyItemExposedInstance = Omit<PSComponentPropertyItem, 'type'> & {
  type: 'EXPOSED_INSTANCE';
  properties?: PSComponentPropertyDefinitions;
};

export type PSComponentPropertyItemInstanceData = Omit<PSComponentPropertyItem, 'type'> & {
  type: 'INSTANCE_SWAP';
  instanceData?: PSInstanceSwapPreferredValue[];
};

export type PSComponentPropertyItems =
  | PSComponentPropertyItem
  | PSComponentPropertyItemInstanceData
  | PSComponentPropertyItemExposedInstance;

export type PSComponentPropertyDefinitions = {
  [propertyName: string]: PSComponentPropertyItems;
};

export type VariantOptionType = string | boolean;
export type VariantDefType = string | boolean | PSInstanceSwapPreferredValue;

export type VariantProps = Record<string, VariantOptionType>;
export type VariantDefProps = Record<string, VariantDefType>;
export type VariantPropsList = Record<string, VariantOptionType[]>;
export type VariantDefPropsList = Record<string, VariantDefType[]>;
export type ComponentGroup = Array<{
  group: string;
  items: Array<VariantProps>;
}>;

export type PSMessage_Create = {
  type: 'create-group';
  data: ComponentGroup;
};

export type PSMessage_Lock = {
  type: 'lock-selection';
  data: {
    lock: boolean;
  };
};

export type PSMessage_Definition = {
  type: 'properties-list';
  data: {
    name: string | null;
    id: string | null;
    isVariant: boolean;
    variants: PSComponentPropertyDefinitions;
  };
};
