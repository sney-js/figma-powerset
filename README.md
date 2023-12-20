# Powerset - Figma Plugin

Powerset is a powerful Figma plugin that renders all permutations of a selected instance based on the values of its variant properties. It's an invaluable tool for QA-ing your component library definitions or showcasing its permutations.

## Features

- **Permutation Rendering**: Generate all possible combinations of a selected instance.
- **Component Library QA**: Ensure your component library is robust and covers all possible scenarios.
- **Showcase Variants**: Easily demonstrate the versatility of your components.

## Quickstart

Follow these steps to get the plugin up and running:

1. Clone this repository to your local machine.
2. Run `npm i` in the project directory to install dependencies.
3. Run `npm run build:watch` to start webpack in watch mode.
4. Open Figma, navigate to `Plugins` -> `Development` -> `Import plugin from manifest...` and choose the `manifest.json` file from this repo.

## Development

### UI Development

To modify the UI of the plugin, make changes within the `src/app` directory. The entry point for the UI is [App.tsx](./src/app/components/App.tsx).

### Messaging and Rendering

To alter Messaging and Rendering in Figma, edit files within the `src/plugin` directory. The entry point for this is [controller.ts](./src/plugin/controller.ts).

For more information on how to work with the Figma API, refer to the [Figma API Overview](https://www.figma.com/plugin-docs/api/api-overview/).

## Tooling

This project uses the following tools and technologies:

- React + Webpack for UI development.
- TypeScript for type safety.
- Prettier precommit hook for code formatting.

## Contributing

We welcome contributions to Powerset! Please review our [contribution guidelines](CONTRIBUTING.md) before getting started.

## License

This project is licensed under the terms of the [MIT license](LICENSE).
