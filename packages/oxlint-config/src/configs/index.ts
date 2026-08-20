import testEssentials from './test/essentials/index.ts';
import testReact from './test/react/index.ts';

const test = {
  essentials: testEssentials,
  react: testReact,
} as const;

export { default as essentials } from './essentials/index.ts';
export { default as jsdoc } from './jsdoc/index.ts';
export { default as nextjs } from './nextjs/index.ts';
export { default as node } from './node/index.ts';
export { default as react } from './react/index.ts';
export { default as storybook } from './storybook/index.ts';
export { default as typescript } from './typescript/index.ts';
export { test };
