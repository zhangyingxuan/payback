// rollup-plugin-alias: 提供 modules 名称的 alias 和 reslove 功能.
// rollup-plugin-babel: 提供 Babel 能力, 需要安装和配置 Babel (这部分知识不在本文涉及)
// rollup-plugin-eslint: 提供 ESLint 能力, 需要安装和配置 ESLint (这部分知识不在本文涉及)
// rollup-plugin-node-resolve: 解析 node_modules 中的模块
// rollup-plugin-commonjs: 转换 CJS -> ESM, 通常配合上面一个插件使用
// rollup-plugin-replace: 类比 Webpack 的 DefinePlugin , 可在源码中通过 process.env.NODE_ENV 用于构建区分 Development 与 Production 环境.
// rollup-plugin-filesize: 显示 bundle 文件大小
// rollup-plugin-uglify: 压缩 bundle 文件
// rollup-plugin-serve: 类比 webpack-dev-server, 提供静态服务器能力
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import eslint from '@rollup/plugin-eslint';
import babel from "@rollup/plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import dts from "rollup-plugin-dts";
import filesize from 'rollup-plugin-filesize';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json' assert { type: "json" };

const name = pkg.name;
// const version = '0.0.1';
// const author = 'blowsysun';
const banner =
  `${'/*!\n' + ' * '}index.js v${pkg.version}\n` +
  ` * (c) 2018-${new Date().getFullYear()} ${pkg.author}\n` +
  ` * Released under the MIT License.\n` +
  ` */`;

const plugins = [
  eslint({
    include: ['src/**/*.ts']
  }),
  // 打包插件
  resolve(), // 查找和打包node_modules中的第三方模块
  json(), // 	将 .json 文件转换为 ES6 模块
  typescript(), // 解析TypeScript
  commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
  babel({ babelHelpers: "bundled" }), // babel配置,编译es6
  filesize(),
  terser()
];

export default [
  {
    input: "src/main.ts", // 打包入口
    output: [
      // umd development version with sourcemap
      // cjs and esm version
      {
        file: `lib/index.js`,
        format: 'cjs',
        banner
      },
      {
        file: `lib/index.umd.js`,
        format: 'umd',
        banner,
        name,
        sourcemap: true
      },
      // cjs and esm version
      {
        file: `es/index.esm.js`,
        format: 'es',
        banner
      }
    ],
    plugins
  },
    {
    input: "src/main.ts", // 打包入口
    output: [
      // umd with compress version
      {
        file: `lib/index.min.js`,
        format: 'umd',
        name,
        banner
      }
    ],
    plugins
  },
  {
    input: "src/main.ts",
    output: [{ file: "es/types/index.d.ts", format: "es" }],
    plugins: [dts()]
  }
];