import { PSMessage } from '../models/Messages';

export const sendPluginMessage = (pluginMessage: PSMessage) => {
  figma.ui.postMessage(pluginMessage);
};