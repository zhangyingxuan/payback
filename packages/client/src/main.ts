import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import App from './App.vue';
import router from './router';
import { usePermissStore } from './store/permiss';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import Stock from './components/stock.vue';
import Plate from './components/plate.vue';

// import hljs from 'highlight.js';
import VMdEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

const app = createApp(App);

VMdEditor.use(vuepressTheme);
VMdPreview.use(vuepressTheme);
// VMdPreview.use(vuepressTheme, {
//   Hljs: hljs,
// });
app.use(VMdEditor);
app.use(VMdPreview);
app.use(createPinia());
app.use(router);
app.use(ElementPlus, {
  locale: zhCn
});
// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// 自定义权限指令
const permiss = usePermissStore();
app.directive('permiss', {
  mounted(el, binding) {
    if (!permiss.key.includes(String(binding.value))) {
      el['hidden'] = true;
    }
  }
});
// 全局组件注册
app.component('Stock', Stock);
app.component('Plate', Plate);

app.mount('#app');
