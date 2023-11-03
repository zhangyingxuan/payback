import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

function init(app: any) {
  app.use(ElementPlus, {
    locale: zhCn
  });
  // 注册elementplus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}

export {
  init,
}