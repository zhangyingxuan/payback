import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import Home from '../views/home.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/charts',
  },
  {
    path: '/works',
    name: 'works',
    meta: {
      title: '作品集',
    },
    component: () => import(/* webpackChunkName: "works" */ '../views/works/index.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/article',
        name: 'article',
        meta: {
          title: '文章列表',
          permiss: '2',
        },
        component: () => import(/* webpackChunkName: "article" */ '../views/article/index.vue'),
      },
      {
        path: '/article-edit',
        name: 'articleEdit',
        meta: {
          title: '文章内容',
          permiss: '2',
        },
        component: () => import(/* webpackChunkName: "article" */ '../views/article/edit.vue'),
      },
      {
        path: '/article-detail',
        name: 'articleDetail',
        meta: {
          title: '文章详情',
          permiss: '2',
        },
        component: () => import(/* webpackChunkName: "article" */ '../views/article/detail.vue'),
      },
      {
        path: '/charts',
        name: 'basecharts',
        meta: {
          title: '复盘',
          permiss: '11',
        },
        component: () => import(/* webpackChunkName: "charts" */ '../views/charts/index.vue'),
      },
      {
        path: '/shortTerm',
        name: 'shortTerm',
        meta: {
          title: '短线',
          permiss: '11',
        },
        component: () => import(/* webpackChunkName: "charts" */ '../views/shortTerm/index.vue'),
      },
      {
        path: '/latestConceptPlate',
        name: 'latestConceptPlate',
        meta: {
          title: '最新概念',
          permiss: '11',
        },
        component: () => import(/* webpackChunkName: "latestConceptPlate" */ '../views/latestConceptPlate/index.vue'),
      },
      {
        path: '/latestNews',
        name: 'latestNews',
        meta: {
          title: '最新资讯',
          permiss: '11',
        },
        component: () => import(/* webpackChunkName: "latestNews" */ '../views/news/index.vue'),
      },
      {
        path: '/systemConfig',
        name: 'systemConfig',
        meta: {
          title: '系统配置',
          permiss: '16',
        },
        component: () => import(/* webpackChunkName: "systemConfig" */ '../views/systemConfig/index.vue'),
      },
      {
        path: '/stockGroupByGainian',
        name: 'stockGroupByGainian',
        meta: {
          title: '概念分组',
          permiss: '11',
        },
        component: () => import(/* webpackChunkName: "stockGroupByGainian" */ '../views/shortTerm/stockGroupByGainian.vue'),
      },
      {
        path: '/form',
        name: 'baseform',
        meta: {
          title: '表单',
          permiss: '5',
        },
        component: () => import(/* webpackChunkName: "form" */ '../views/form.vue'),
      },
      {
        path: '/tabs',
        name: 'tabs',
        meta: {
          title: 'tab标签',
          permiss: '3',
        },
        component: () => import(/* webpackChunkName: "tabs" */ '../views/tabs.vue'),
      },
      {
        path: '/permission',
        name: 'permission',
        meta: {
          title: '权限管理',
          permiss: '13',
        },
        component: () => import(/* webpackChunkName: "permission" */ '../views/permission.vue'),
      },
      {
        path: '/upload',
        name: 'upload',
        meta: {
          title: '上传插件',
          permiss: '6',
        },
        component: () => import(/* webpackChunkName: "upload" */ '../views/upload.vue'),
      },
      {
        path: '/icon',
        name: 'icon',
        meta: {
          title: '自定义图标',
          permiss: '10',
        },
        component: () => import(/* webpackChunkName: "icon" */ '../views/icon.vue'),
      },
      {
        path: '/user',
        name: 'user',
        meta: {
          title: '个人中心',
        },
        component: () => import(/* webpackChunkName: "user" */ '../views/user.vue'),
      },
      // {
      //   path: '/markdown',
      //   name: 'markdown',
      //   meta: {
      //     title: 'markdown编辑器',
      //     permiss: '9',
      //   },
      //   component: import(/* webpackChunkName: "markdown" */  '../views/article/oldIndex.vue'),
      // }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
    },
    component: () => import(/* webpackChunkName: "login" */ '../views/login/index.vue'),
  },
  {
    path: '/403',
    name: '403',
    meta: {
      title: '没有权限',
    },
    component: () => import(/* webpackChunkName: "403" */ '../views/403.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | pay-back`;

  // 设置浏览器顶部theme-color（兼容Safari）
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');

  if (to.path === '/works') {
    // works页面：theme-color与页面背景色相同（蓝色渐变背景）
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#60a5fa');
    }
    if (appleStatusBarMeta) {
      appleStatusBarMeta.setAttribute('content', 'black-translucent');
    }
  } else {
    // 其他页面：设置为#324157
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#324157');
    }
    if (appleStatusBarMeta) {
      appleStatusBarMeta.setAttribute('content', 'default');
    }
  }

  const permiss = usePermissStore();
  // 允许未登录用户访问登录页面和作品集页面
  if (!permiss.name && to.path !== '/login' && to.path !== '/works') {
    next('/login');
  } else if (to.meta.permiss && !permiss.key.includes(to.meta.permiss)) {
    // 如果没有权限，则进入403
    next('/403');
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  // 每次路由变化后，手动推送新的页面路径给百度统计
  if (window._hmt) {
    window._hmt.push(['_trackPageview', to.fullPath]);
  }
});

export default router;
