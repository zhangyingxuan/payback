import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import Home from '../views/home.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/charts',
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        meta: {
          title: '系统首页',
          permiss: '1',
        },
        component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
      },
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
  const role = localStorage.getItem('ms_username');
  const permiss = usePermissStore();
  if (!role && to.path !== '/login') {
    next('/login');
  } else if (to.meta.permiss && !permiss.key.includes(to.meta.permiss)) {
    // 如果没有权限，则进入403
    next('/403');
  } else {
    next();
  }
});

export default router;
