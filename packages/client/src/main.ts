import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { usePermissStore } from './store/permiss';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import Stock from './components/stock.vue';
import Plate from './components/plate.vue';
import { init as VMdEditorInit } from '@/core/VMdEditor';
import { init as ElementPlusInit } from '@/core/ElementPlus';
import { init as echartsInit } from '@/core/echarts';

const app = createApp(App);
VMdEditorInit(app);
ElementPlusInit(app);
echartsInit(app);

app.use(createPinia());
app.use(router);
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
