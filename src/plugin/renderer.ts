import { PSMessage_Create, VariantProps } from '../models/Messages';
import { getMasterComponent } from './components';

async function makeText(text: string) {
  const groupText = figma.createText();
  await figma.loadFontAsync(groupText.fontName as FontName);
  groupText.characters = text;
  groupText.fontSize = 18;
  return groupText;
}

export async function layComponentGroup(
  instanceNode: InstanceNode,
  data: PSMessage_Create['data']
) {
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
    groupFrame.clipsContent = false;
    groupFrame.backgrounds = [];
    groupFrame.counterAxisSpacing = 32;

    items.forEach((instanceProperties: VariantProps, j) => {
      let newVariant: InstanceNode = instanceNode.clone();
      newVariant.setProperties(instanceProperties);
      groupFrame.insertChild(j, newVariant);
    });
  }
  return nodes;
}
