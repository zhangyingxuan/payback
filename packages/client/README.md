# vue3-element-plus-vite3

<a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/vue-3.1.2-brightgreen.svg" alt="vue">
  </a>
  <a href="https://github.com/vuejs/pinia">
    <img src="https://img.shields.io/badge/pinia-2.0.14-brightgreen.svg" alt="pinia">
  </a>

## 前言

该方案作为一套多功能的后台框架模板，适用于绝大部分的后台管理系统开发。基于 Vue3 + pinia + typescript，引用 Element Plus 组件库，方便开发。实现逻辑简单，适合外包项目，快速交付。

## 功能

-   [x] Element Plus
-   [x] vite 3
-   [x] pinia
-   [x] typescript
-   [x] 登录/注销
-   [x] Dashboard
-   [x] 表格
-   [x] Tab 选项卡
-   [x] 表单
-   [x] 图表 :bar_chart:
-   [x] 富文本/markdown编辑器
-   [x] 图片拖拽/裁剪上传
-   [x] 权限管理
-   [x] 三级菜单
-   [x] 自定义图标


## 安装步骤
> 因为使用vite3，node版本需要 14.18+

```
// 安装项目依赖，等待安装完成之后，安装失败可用 cnpm 或 yarn
npm install         

// 运行
npm run dev

// 执行构建命令，生成的dist文件夹放在服务器下即可访问
npm run build
```

## 问题集：
1. dayjs 苹果兼容问题，需完整年月日 格式字符串，才能进行星期几计算
2. 