import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
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
        path: '/news',
        name: 'news',
        meta: {
          title: '新闻列表',
          permiss: '2',
        },
        component: () => import(/* webpackChunkName: "news" */ '../views/news/index.vue'),
      },
      {
        path: '/news-edit',
        name: 'newsEdit',
        meta: {
          title: '新闻内容',
          permiss: '2',
        },
        component: () => import(/* webpackChunkName: "news" */ '../views/news/edit.vue'),
      },
      {
        path: '/news-detail',
        name: 'newsDetail',
        meta: {
          title: '新闻详情',
          permiss: '2',
        },
        component: () => import(/* webpackChunkName: "news" */ '../views/news/detail.vue'),
      },
      {
        path: '/charts',
        name: 'basecharts',
        meta: {
          title: '图表',
          permiss: '11',
        },
        component: () => import(/* webpackChunkName: "charts" */ '../views/charts.vue'),
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
      {
        path: '/editor',
        name: 'editor',
        meta: {
          title: '富文本编辑器',
          permiss: '8',
        },
        component: () => import(/* webpackChunkName: "editor" */ '../views/editor.vue'),
      },
      {
        path: '/markdown',
        name: 'markdown',
        meta: {
          title: 'markdown编辑器',
          permiss: '9',
        },
        component: () => import(/* webpackChunkName: "markdown" */ '../views/markdown.vue'),
      }
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
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | vue-manage-system`;
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

/* 正则使用'\S'而不是'\d' 为了适配写魔法注释的朋友，写'\d'遇到魔法注释就匹配不成功了。
 * 使用reload方法而不是replace原因是replace还是去请求之前的js文件，会导致循环报错。
 * reload会刷新页面， 请求最新的index.html以及最新的js路径。
 * 直接修改location.href或使用location.assign或location.replace，和router.replace同理，
 * 在当前场景中请求的依然是原来的js文件，区别仅有浏览器的历史栈。因此必须采用reload.
 * reload()有个特点是当你在A页面试图进入B页面的时候报错，会在A页面刷新，因此在刷新后需要手动书写逻辑
 * 进入B页面，可以在router.onReady()方法里面书写
 * 为了避免在特殊情况下服务器丢失资源导致无限报错刷新，做了一步控制，仅尝试一次进入B页面，
 * 如果不成功就只刷新A页面，停留在当前的A页面。
 */
// router.onError((error) => {
//   const jsPattern = /Loading chunk (\S)+ failed/g;
//   const cssPattern = /Loading CSS chunk (\S)+ failed/g;
//   const isChunkLoadFailed = error.message.match(jsPattern || cssPattern);
//   const targetPath = router.history.pending.fullPath;
//   if (isChunkLoadFailed) {
//     localStorage.setItem('targetPath', targetPath);
//     window.location.reload();
//   }
// });
// router.onReady(() => {
//   const targetPath = localStorage.getItem('targetPath');
//   const tryReload = localStorage.getItem('tryReload');
//   if (targetPath) {
//     localStorage.removeItem('targetPath');
//     if (!tryReload) {
//       router.replace(targetPath);
//       localStorage.setItem('tryReload', true);
//     } else {
//       localStorage.removeItem('tryReload');
//     }
//   }
// });
export default router;
