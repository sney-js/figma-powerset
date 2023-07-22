export type PluginMessages = 'create-group' | 'properties-list' | 'complete';

export type ComponentGroup = Array<{
  group: string;
  items: Array<{
    [key: string]: string | boolean | VariableAlias;
  }>;
}>;

export type PSMessage = {
  type: PluginMessages;
  data?: any;
  message?: string;
};

export type PSMessage_Component = {
  type: 'create-group';
  data: ComponentGroup;
};
