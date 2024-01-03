import { PSMessage_Create, VariantProps } from '../models/Messages';
import { isInstance } from './InstanceUtils';

const POWERSET_FRAME_PREFIX = 'Powerset/';

async function makeText(text: string) {
  const groupText = figma.createText();
  await figma.loadFontAsync(groupText.fontName as FontName);
  groupText.characters = text;
  groupText.fontSize = 18;
  return groupText;
}

function setGroupFrameLayout(groupFrame: FrameNode, group: string) {
  groupFrame.name = group;
  groupFrame.layoutMode = 'HORIZONTAL';
  groupFrame.layoutWrap = 'WRAP';
  groupFrame.layoutSizingHorizontal = 'FILL';
  groupFrame.layoutSizingVertical = 'HUG';
  groupFrame.itemSpacing = 32;
  groupFrame.clipsContent = false;
  groupFrame.backgrounds = [];
  groupFrame.counterAxisSpacing = 32;
}

function fetchMainFrame(name: string, instanceNode: InstanceNode) {
  name = POWERSET_FRAME_PREFIX + name;
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

function setInstanceRenderAlert(
  items: Array<VariantProps>,
  createdInstances: number
) {
  const errored = items.length - createdInstances;
  figma.notify(
    [
      `Created ${createdInstances} instances!`,
      errored ? ` Error creating ${errored} instances.` : '',
    ].join('')
  );
}

export async function layComponentGroup(
  instanceNode: InstanceNode,
  data: PSMessage_Create['data']
) {
  figma.commitUndo();
  const nodes = [];

  // const masterComp = getMasterComponent(instanceNode);
  const mainFrame = fetchMainFrame(instanceNode.name, instanceNode);
  nodes.push(mainFrame);

  let i = 0;
  for (const { group, items } of data) {
    // const groupText = await makeText(group);
    // mainFrame.insertChild(i++, groupText);
    // groupText.layoutSizingHorizontal = 'HUG';

    const groupFrame = figma.createFrame();
    mainFrame.insertChild(i++, groupFrame);
    setGroupFrameLayout(groupFrame, group);

    let createdInstances = 0;
    items.forEach((instanceProperties, j) => {
      const newVariant: InstanceNode = instanceNode.clone();
      const { __exposedInstances, ...mainProps } = instanceProperties;
      try {
        newVariant.setProperties(mainProps);
        // set twice to reset icon colors perhaps
        // newVariant.resetOverrides();
        // newVariant.setProperties(instanceProperties);
        // ----------------- render ------------------------
        groupFrame.insertChild(j, newVariant);
        createdInstances++;
      } catch (e) {
        newVariant.remove();
      }
      // --------- find and set properties on exposedInstances ----------
      Object.keys(__exposedInstances).forEach((exposedInstanceId) => {
        const exposedInstance = newVariant.findOne(
          (n) => n.id.split(';')[1] === exposedInstanceId.split(';')[1]
        );
        if (isInstance(exposedInstance)) {
          exposedInstance.setProperties(__exposedInstances[exposedInstanceId]);
        }
      });
    });

    if (createdInstances) {
      setInstanceRenderAlert(items, createdInstances);
    }
  }
  figma.commitUndo();
  return nodes;
}

export const selectAndView = (nodes: SceneNode[], select = false) => {
  if (select) {
    figma.currentPage.selection = nodes;
  }
  figma.viewport.scrollAndZoomIntoView(nodes);
};
