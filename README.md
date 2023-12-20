# Powerset - Figma Plugin

Powerset renders all permutations of a selected instance based on the values of its variant properties. The created combinations can help you QA your component library definitions, or showcase its permutations.

## Quickstart

- Run `npm i` to install dependencies.
- Run `npm run build:watch` to start webpack in watch mode.
- Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and choose `manifest.json` file from this repo.

## Development
1. To change the UI of your plugin, edit files within `src/app`.
    1. Entry point: [App.tsx](./src/app/components/App.tsx). 
2. To change Messaging and Rendering in Figma, edit files within `src/plugin`.
    1. Entry point: [controller.ts](./src/plugin/controller.ts).  
3. Read more on the [Figma API Overview](https://www.figma.com/plugin-docs/api/api-overview/).

## Toolings

This repo is using:

- React + Webpack
- TypeScript
- Prettier precommit hook
