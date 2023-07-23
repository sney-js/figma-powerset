export type PluginMessages = 'create-group' | 'properties-list' | 'complete';

export type PSMessage = {
  type: PluginMessages;
  data?: any;
  message?: string;
};

export type PSInstanceSwapPreferredValue = {
  name: string;
  id: string;
}

export type PSComponentPropertyDefinitions = {
  [propertyName: string]: {
    instanceData?: PSInstanceSwapPreferredValue[]
  }
} & ComponentPropertyDefinitions;

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

export type PSMessage_Component = {
  type: 'create-group';
  data: ComponentGroup;
};

export type PSMessage_Definition = {
  type: 'properties-list';
  data: {
    name: string;
    variants: ComponentPropertyDefinitions
  };
};
