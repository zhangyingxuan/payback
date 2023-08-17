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
import eslint from '@rollup/plugin-eslint';
import babel from "@rollup/plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import filesize from 'rollup-plugin-filesize';
import { terser } from "rollup-plugin-terser";
// import { name, version, author } from './package.json' assert {
//   type: 'json',
// };
const name = 'pay-back-core';
const version = '0.0.1';
const author = 'blowsysun';
const banner =
  `${'/*!\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2018-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the MIT License.\n` +
  ` */`;

export default [
  {
  input: "src/main.ts", // 打包入口
  output: [
    // umd development version with sourcemap
    {
      file: `dist/${name}.js`,
      format: 'umd',
      name,
      banner,
      sourcemap: true
    },
    // cjs and esm version
    {
      file: `dist/${name}.cjs.js`,
      format: 'cjs',
      banner
    },
    // cjs and esm version
    {
      file: `dist/${name}.esm.js`,
      format: 'es',
      banner
    }
  ],
  plugins: [
    eslint({
      include: ['src/**/*.ts']
    }),
    // 打包插件
    resolve(), // 查找和打包node_modules中的第三方模块
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    typescript(), // 解析TypeScript
    babel({ babelHelpers: "bundled" }), // babel配置,编译es6
    filesize(),
    terser(),
  ],
},
  {
  input: "src/main.ts", // 打包入口
  output: [
    // umd with compress version
    {
      file: `dist/${name}.min.js`,
      format: 'umd',
      name,
      banner
    }
  ],
  plugins: [
    eslint({
      include: ['src/**/*.ts']
    }),
    // 打包插件
    resolve(), // 查找和打包node_modules中的第三方模块
    commonjs(), // 将 CommonJS 转换成 ES2015 模块供 Rollup 处理
    typescript(), // 解析TypeScript
    babel({ babelHelpers: "bundled" }), // babel配置,编译es6
    filesize(),
    terser(),
  ],
},

];