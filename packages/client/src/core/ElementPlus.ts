// import ElementPlus from 'element-plus';
// import zhCn from 'element-plus/es/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

function init(app: any) {
  // 改为 unplugin-vue-components unplugin-auto-import 按需加载，这里注释掉引入
  // app.use(ElementPlus, {
  //   locale: zhCn
  // });
  // 注册elementplus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}

export {
  init,
}