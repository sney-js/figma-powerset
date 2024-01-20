export type PluginMessages =
  | 'create-group'
  | 'properties-list'
  | 'complete'
  | 'minimise-ui'
  | 'target'
  | 'focus-id'
  | 'lock-selection';

export type PSMessage = {
  type: PluginMessages;
  data?: any;
  message?: string;
};

export type PSLayerInfo = {
  name: string;
  id: string;
};

export type PSComponentPropertyItem = ComponentPropertyDefinitions[string] & {
  controlsLayers?: PSLayerInfo[];
  disabledByProperty?: string[];
};

export type PSComponentPropertyExposed = (PSLayerInfo & {
  variants?: PSComponentPropertyDefinitions;
  /**
   *  The value of these properties must be true for this exposedInstance to be valid..
   */
  disabledByProperty?: string[];
})[];

export type PSComponentPropertyItemInstanceData = Omit<
  PSComponentPropertyItem,
  'type'
> & {
  type: 'INSTANCE_SWAP';
  instanceData?: PSComponentPropertyExposed;
};

export type PSComponentPropertyItems =
  | PSComponentPropertyItem
  | PSComponentPropertyItemInstanceData;

export type PSComponentPropertyDefinitions = {
  [propertyName: string]: PSComponentPropertyItems;
};

export type VariantOptionType = string | boolean;
export type VariantDefType = string | boolean;

export type VariantProps = Record<string, VariantOptionType>;
export type VariantDefPropsList = Record<string, VariantDefType[]>;
export type ResponseExposedInstancesVariantProps = {
  __exposedInstances?: Record<string, VariantProps>;
};
export type ComponentGroup = Array<{
  group: string;
  items: Array<VariantProps & ResponseExposedInstancesVariantProps>;
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
    exposedInstances: PSComponentPropertyExposed;
  };
};
