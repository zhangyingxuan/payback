import { createApp } from 'vue';
import { createPinia } from 'pinia';
// 引入pinia 持久化插件
// import piniaPersist from 'pinia-plugin-persist' 
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import Stock from './components/stock.vue';
import PlatePopover from './components/platePopover.vue';
import StockPopover from './components/stockPopover.vue';
import StockTooltip from './components/stockTooltip.vue';
import Plate from './components/plate.vue';
import { init as VMdEditorInit } from '@/core/VMdEditor';
import { init as ElementPlusInit } from '@/core/ElementPlus';
import { init as echartsInit } from '@/core/echarts';
import { setupDirectives } from '@/core/directives';
import { usePermissStore } from '@/store/permiss';
import { initAegis } from '@/core/aegisMonitor';

const app = createApp(App);
// 初始化 Pinia
const pinia = createPinia();
// pinia.use(piniaPersist);
app.use(pinia);

// 自定义权限指令
const permiss = usePermissStore();

VMdEditorInit(app);
ElementPlusInit(app);
echartsInit(app);
// 初始化监控
initAegis(app);
//注册指令
setupDirectives(app, permiss);

app.use(router);

// 全局组件注册
app.component('Stock', Stock);
app.component('PlatePopover', PlatePopover);
app.component('StockPopover', StockPopover);
app.component('StockTooltip', StockTooltip);
app.component('Plate', Plate);

app.mount('#app');
