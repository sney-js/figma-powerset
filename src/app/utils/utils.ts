import { PSMessage } from '../../models/Messages';

export function capitalise(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function cssVars(object: Record<string, string | number>): Record<string, string | number> {
  return object;
}

export function sendPluginMessage(pluginMessage: PSMessage) {
  window.parent.postMessage({ pluginMessage }, '*');
}

export function truncate(str: string, limit = 35) {
  const regex = new RegExp(`(.{${limit}})..+`, 'g');
  return str?.replace(regex, '$1…');
}
