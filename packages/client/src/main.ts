import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import Stock from './components/stock.vue';
import Plate from './components/plate.vue';
import { init as VMdEditorInit } from '@/core/VMdEditor';
import { init as ElementPlusInit } from '@/core/ElementPlus';
import { init as echartsInit } from '@/core/echarts';
import { setupDirectives } from '@/core/directives';
import { usePermissStore } from '@/store/permiss';

const app = createApp(App);
// 初始化 Pinia
app.use(createPinia());

// 自定义权限指令
const permiss = usePermissStore();

VMdEditorInit(app);
ElementPlusInit(app);
echartsInit(app);
//注册指令
setupDirectives(app, permiss);

app.use(router);

// 全局组件注册
app.component('Stock', Stock);
app.component('Plate', Plate);

app.mount('#app');
