/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'pay-back-core'
declare module 'vue-schart';
declare module 'vue-cropperjs';
declare module '@kangc/v-md-editor'
declare module '@kangc/v-md-editor/lib/preview'
declare module '@kangc/v-md-editor/lib/theme/vuepress.js'