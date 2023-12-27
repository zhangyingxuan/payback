import { App } from 'vue';
import { isAdmin } from '@/store/permiss';

export function setupDirectives(app: App, permiss: any) {
  // 权限控制指令
  app.directive('isAdmin', {
    mounted(el: HTMLButtonElement, binding) {
      // if (binding.value == undefined) return;
      if (!isAdmin) {
        el.remove();
      }
    },
  });
  app.directive('permiss', {
    mounted(el, binding) {
      if (!permiss.key.includes(String(binding.value))) {
        el['hidden'] = true;
      }
    }
  });
}