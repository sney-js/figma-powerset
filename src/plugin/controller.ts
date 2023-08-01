import { getMasterComponent, getMasterPropertiesDefinition, isInstance } from './components';
import { PSMessage, PSMessage_Create, PSMessage_Definition } from '../models/Messages';
import { layComponentGroup } from './renderer';

figma.showUI(__html__, {
  width: 420,
  height: 600,
});

let lockSelection = false;
let lastInstance: InstanceNode = null;

const sendPluginMessage = (pluginMessage: PSMessage) => {
  figma.ui.postMessage(pluginMessage);
};

async function readSelection() {
  if (lockSelection) return;
  const selection = figma.currentPage.selection[0];
  console.log(selection?.id, 'selection.id');

  if (isInstance(selection)) {
    const master = getMasterComponent(selection satisfies InstanceNode);

    function sendVariantsDataToPlugin(allVariants: ComponentPropertyDefinitions) {
      sendPluginMessage({
        type: 'properties-list',
        data: {
          name: master.name,
          id: selection.id,
          isVariant: true,
          variants: allVariants,
        },
      } satisfies PSMessage_Definition);
    }

    const allVariants = await getMasterPropertiesDefinition(selection, false);
    sendVariantsDataToPlugin(allVariants);
    lastInstance = selection;
    getMasterPropertiesDefinition(selection, true).then((data) => {
      console.log(data, 'allVariants');
      sendVariantsDataToPlugin(data);
    });
  } else {
    lastInstance = null;
    sendPluginMessage({
      type: 'properties-list',
      data: {
        name: selection?.name || null,
        id: selection?.id || null,
        isVariant: false,
        variants: null,
      },
    } satisfies PSMessage_Definition);
    console.log('Not an instance');
  }
}

const selectAndView = (nodes: SceneNode[], select = false) => {
  if (select) {
    figma.currentPage.selection = nodes;
  }
  figma.viewport.scrollAndZoomIntoView(nodes);
};

function instanceExists(instance?: InstanceNode) {
  try {
    instance?.mainComponent;
    return true;
  } catch (e) {
    return false;
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
  }
  // figma.closePlugin();
};

figma.ui.onmessage = (msg) => {
  handlePluginMessage(msg).then();
};
figma.on('selectionchange', readSelection);
