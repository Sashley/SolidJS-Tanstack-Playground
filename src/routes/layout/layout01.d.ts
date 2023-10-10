// layout01.d.ts

import { JSX } from 'solid-js/jsx-runtime';

declare module "*.jsx" {
  const content: (props: JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
  // const content: (props: JSX.IntrinsicElements['div']) => JSX.Element;
  export default content;
}
