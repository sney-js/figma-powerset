import {
  PSMessage,
  PSMessage_Create,
  PSMessage_Definition,
} from '../models/Messages';
import {
  getExposedInstanceProperties,
  getMasterComponent,
  getMasterPropertiesDefinition,
  instanceExists,
  isInstance,
} from './InstanceUtils';
import { sendPluginMessage } from './MessageUtils';
import { layComponentGroup, selectAndView } from './renderer';

let lockSelection = false;
let lastInstance: InstanceNode = null;

async function readSelection() {
  if (lockSelection) return;
  const selection = figma.currentPage.selection[0];

  if (isInstance(selection)) {
    const master = getMasterComponent(selection satisfies InstanceNode);

    const componentDefinitions = await getMasterPropertiesDefinition(
      selection,
      true
    );
    const exposedInstancesDefinitions = await getExposedInstanceProperties(
      selection,
      true
    );

    lastInstance = selection;
    sendPluginMessage({
      type: 'properties-list',
      data: {
        name: master.name,
        id: selection.id,
        isVariant: true,
        variants: componentDefinitions,
        exposedInstances: exposedInstancesDefinitions || [],
      },
    } satisfies PSMessage_Definition);
  } else {
    lastInstance = null;
    sendPluginMessage({
      type: 'properties-list',
      data: {
        name: selection?.name || null,
        id: selection?.id || null,
        isVariant: false,
        variants: null,
        exposedInstances: [],
      },
    } satisfies PSMessage_Definition);
  }
}

const handlePluginMessage = async (message: PSMessage) => {
  switch (message.type) {
    case 'lock-selection':
      lockSelection = message.data.lock === true;
      let currSelection = figma.currentPage.selection[0];
      if (currSelection?.id !== lastInstance?.id) {
        readSelection().then();
      }
      break;
    case 'create-group':
      if (lastInstance && lastInstance.type === 'INSTANCE') {
        const data = message.data satisfies PSMessage_Create['data'];
        if (instanceExists(lastInstance)) {
          const nodes = await layComponentGroup(lastInstance, data);
          selectAndView(nodes, false);
        } else {
          figma.notify('Pinned Instance not found!');
        }
      }
      break;
    case 'target':
      if (lastInstance) selectAndView([lastInstance], true);
      break;
    case 'focus-id':
      const foundID = figma.getNodeById(message.data) as SceneNode;
      if (foundID) {
        selectAndView([foundID], true);
      }
      break;
  }
  // figma.closePlugin();
};

// ---------------------FIGMA COMMANDS---------------------

figma.showUI(__html__, {
  width: 420,
  height: 600,
});

figma.ui.onmessage = (msg) => {
  handlePluginMessage(msg).then();
};
figma.on('selectionchange', readSelection);
