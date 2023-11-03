
// import hljs from 'highlight.js';
import VMdEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

VMdEditor.use(vuepressTheme);
VMdPreview.use(vuepressTheme);

function init(app: any) {
  app.use(VMdEditor);
  app.use(VMdPreview);
}

export {
  init,
}