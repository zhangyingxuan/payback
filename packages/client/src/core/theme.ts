import { ref, watch } from 'vue';

export type AppTheme = 'classic' | 'bull';

// 登录前后共用同一份主题状态，刷新后恢复用户选择。
const savedTheme = localStorage.getItem('payback-theme');
export const theme = ref<AppTheme>(savedTheme === 'bull' ? 'bull' : 'classic');

watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
  localStorage.setItem('payback-theme', value);
}, { immediate: true });

export function toggleTheme() {
  theme.value = theme.value === 'classic' ? 'bull' : 'classic';
}
