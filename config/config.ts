// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV, BUILD_ENV } = process.env;

export default defineConfig({
  // hash: true,
  https: false,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: false,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/BasicLayout',
      authority: ['admin'],
      routes: [
        {
          path: '/',
          redirect: '/report',
        },
        {
          name: '报告配置',
          icon: 'solution',
          path: '/report',
          routes: [
            {
              name: '详情配置',
              path: '/report/report_config',
              component: './report/reportConfig',
            },
            {
              path: '/report/braftEditors',
              component: './report/reportConfig/braftEditors.jsx',
            },
            {
              path: '/report/wangeditor',
              component: './report/braftEditor/weditor.jsx',
            },
            {
              path: '/report/tableView',
              component: './report/braftEditor/tableView.jsx',
            },
            {
              name: '检测项',
              path: '/report/trait_config',
              component: './report/traitConfig',
            },
            {
              name: '检测项分类',
              path: '/report/trait_category',
              component: './report/traitCategory',
            },
          ],
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
