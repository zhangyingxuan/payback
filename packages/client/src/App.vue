<template>
  <router-view />
</template>

<style lang="less">
@import './assets/css/main.css';
@import './assets/css/color-dark.css';
@import './styles/variables.less';
@import './styles/index.less';
</style>

<style>
/* 只调整界面主题色，保留行情涨跌等业务颜色。 */
html[data-theme="bull"] { --el-color-primary: #ae3e35; --el-color-primary-light-3: #c76c62; --el-color-primary-light-5: #d5958c; --el-color-primary-light-7: #e7c0ba; --el-color-primary-light-8: #f0d8d3; --el-color-primary-light-9: #faf0ee; --el-color-primary-dark-2: #8b3029; }
html[data-theme="bull"] .header, html[data-theme="bull"] .header.monthEnd { background-color: #772c2a; }
html[data-theme="bull"] .collapse-btn:hover { background-color: #913c37; }
html[data-theme="bull"] .content-box, html[data-theme="bull"] .content-box-mobile { background: #f8f0ed; }
html[data-theme="bull"] .sidebar .el-menu-item:hover, html[data-theme="bull"] .sidebar .el-sub-menu__title:hover { background: #833b36; }
html[data-theme="bull"] .conv-panel { background: #fcf6f4; border-color: #f0ded9; }
html[data-theme="bull"] .conv-panel .conv-item.active { background: #f8e2dc; color: #9c342d; }
html[data-theme="bull"] .chat-head .head-busy { color: #ad4036; }
html[data-theme="bull"] .empty-state .empty-logo { background: linear-gradient(135deg, #b63f35, #df895f); }
html[data-theme="bull"] .empty-state .suggestion-card:hover { border-color: #b63f35; color: #a53930; background: #fff6f3; }
html[data-theme="bull"] .composer .composer-box.focused { border-color: #b63f35; box-shadow: 0 0 0 3px rgba(182, 63, 53, .12); }
html[data-theme="bull"] .chat-message .user-bubble { background: #a93b32; }
html[data-theme="bull"] .tags-li.active { background: #ae3e35; border-color: #ae3e35; }
</style>
