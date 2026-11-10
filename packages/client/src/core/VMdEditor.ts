
// import hljs from 'highlight.js';
import VMdEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import Prism from 'prismjs';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

// 主题解析带语言标识的代码块时需要 Prism。
VMdEditor.use(vuepressTheme, { Prism });
VMdPreview.use(vuepressTheme, { Prism });

function init(app: any) {
  app.use(VMdEditor);
  app.use(VMdPreview);
}

export {
  init,
}
