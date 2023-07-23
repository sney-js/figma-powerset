export type PluginMessages = 'create-group' | 'properties-list' | 'complete';

export type PSMessage = {
  type: PluginMessages;
  data?: any;
  message?: string;
};

export type VariantOptionType = string | boolean | VariableAlias;

export type VariantProps = Record<string, VariantOptionType>;
export type VariantPropsList = Record<string, VariantOptionType[]>;

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
