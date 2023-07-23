import {
  getMasterComponent,
  getMasterPropertiesDefinition,
  isComponentOrVariant,
} from './components';
import {PSMessage, PSMessage_Component, PSMessage_Definition, VariantProps} from '../models/Messages';

figma.showUI(__html__, {
  width: 420,
  height: 600,
});

function readSelection() {
  const selection = figma.currentPage.selection[0];
  if (isComponentOrVariant(selection)) {
    const master = getMasterComponent(selection);
    let allVariants = getMasterPropertiesDefinition(selection);
    console.log(allVariants, 'allVariants');
    // selectAndView([masterComponent]);
    figma.ui.postMessage({
      type: 'properties-list',
      data: {
        name: master.name,
        variants: allVariants,
      },
    } satisfies PSMessage_Definition);
  } else {
    figma.ui.postMessage({
      type: 'properties-list',
      data: {
        name: selection?.name || 'None',
        variants: null,
      },
    });
    console.log('Not an instance');
  }
}

figma.on('selectionchange', readSelection);

function selectAndView(nodes: any[]) {
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

async function makeText(text: string) {
  const groupText = figma.createText();
  await figma.loadFontAsync(groupText.fontName as FontName);
  groupText.characters = text;
  groupText.fontSize = 18;
  return groupText;
}

async function layComponentGroup(instanceNode: InstanceNode, data: PSMessage_Component['data']) {
  const nodes = [];

  function getMainFrame(name) {
    const existingFrame = figma.currentPage.findOne((n) => n.name === name);
    if (existingFrame && existingFrame.type === 'FRAME') {
      existingFrame.children.map((x) => x.remove());
      return existingFrame;
    }
    let frame = figma.createFrame();
    frame.name = name;
    frame.resize(1500, 1000);
    frame.x = instanceNode.x + 1000;
    frame.y = instanceNode.y;
    frame.layoutPositioning = 'AUTO';
    frame.layoutMode = 'VERTICAL';
    let PAD = 72;
    frame.paddingTop = PAD;
    frame.paddingBottom = PAD;
    frame.paddingLeft = PAD;
    frame.paddingRight = PAD;
    frame.itemSpacing = PAD / 2;
    return frame;
  }

  const masterComp = getMasterComponent(instanceNode);
  const mainFrame = getMainFrame('Powerset-' + masterComp.name);
  nodes.push(mainFrame);

  let i = 0;
  for (const { group, items } of data) {
    console.log(group, 'group', data);
    const groupText = await makeText(group);
    mainFrame.insertChild(i++, groupText);
    groupText.layoutSizingHorizontal = 'HUG';

    const groupFrame = figma.createFrame();
    mainFrame.insertChild(i++, groupFrame);
    groupFrame.layoutMode = 'HORIZONTAL';
    groupFrame.layoutWrap = 'WRAP';
    groupFrame.layoutSizingHorizontal = 'FILL';
    groupFrame.layoutSizingVertical = 'HUG';
    groupFrame.itemSpacing = 32;
    groupFrame.counterAxisSpacing = 32;

    items.forEach((instanceProperties: VariantProps, j) => {
      let newVariant: InstanceNode = instanceNode.clone();
      newVariant.setProperties(instanceProperties);
      groupFrame.insertChild(j, newVariant);
    });
  }
  return nodes;
}


figma.ui.onmessage = async (message: PSMessage) => {
  if (message.type === 'create-group') {
    const selection = figma.currentPage.selection[0];
    if (selection && selection.type === 'INSTANCE') {
      const data = message.data satisfies PSMessage_Component['data'];
      const nodes = await layComponentGroup(selection, data);
      selectAndView(nodes);
    }

    // This is how figma responds back to the ui
    figma.ui.postMessage({
      type: 'complete',
      message: `Completed`,
    } as PSMessage);
  }

  // figma.closePlugin();
};
