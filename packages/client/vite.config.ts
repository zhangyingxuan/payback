import { UserConfigExport, loadEnv, ConfigEnv } from 'vite';
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
// 暂时注释 该插件，便于调试，该插件用于 steup语法糖下 按组件name 区分
// import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// import markdownLoader from './build/markdownLoader';
import { warpperEnv } from "./build/index";
import path from 'path';
import compress from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';


/** 路径查找 */
const pathResolve = (dir: string): string => {
	return resolve(__dirname, ".", dir);
};

/** 设置别名 */
const alias: Record<string, string> = {
	"@": pathResolve("src"),
	"@build": pathResolve("build")
};

export default ({ command, mode }: ConfigEnv): UserConfigExport => {
	const { VITE_CDN, VITE_PORT, VITE_BASE_API_THS_NEWS, VITE_BASE_API_THS, VITE_BASE_API_THS_DQ, VITE_BASE_API } =
		warpperEnv(loadEnv(mode, process.cwd()));
	return {
		base: './',
		resolve: {
			alias
		},
		server: {
			// 是否开启 https
			https: false,
			// 端口号
			port: VITE_PORT,
			host: "0.0.0.0",
			open: true, // 这里开启自动打开浏览器是可选项
			// 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
			proxy: {
				'/blowsysun': {
					target: VITE_BASE_API,
					changeOrigin: false,
				},
				'/tonghuashun': {
					target: VITE_BASE_API_THS,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/tonghuashun/, ''),
				},
				'/thsNews': {
					target: VITE_BASE_API_THS_NEWS,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/thsNews/, ''),
				},
				'/thsDq': {
					target: VITE_BASE_API_THS_DQ,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/thsDq/, ''),
				},
			}
		},
		// 浏览器兼容性配置
		build: {
			minify: "esbuild",
			// 浏览器兼容性目标
			target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
			outDir: path.resolve(__dirname, 'dist'),
			emptyOutDir: true,
			rollupOptions: {
				// input: viteMultiPages,
				output: {
					manualChunks: (id) => {
						if (
							id.indexOf('/node_modules/echarts/') !== -1
						) {
							return 'vendor-echarts';
						}
						// if (
						// 	id.indexOf('node_modules/core-js/') !== -1 ||
						// 	id.indexOf('node_modules/@vue/') !== -1 ||
						// 	id.indexOf('node_modules/vue/') !== -1 ||
						// 	id.indexOf('node_modules/vue-router/') !== -1 ||
						// 	id.indexOf('node_modules/vuex/') !== -1 ||
						// 	id.indexOf('node_modules/axios/') !== -1
						// ) {
						// 	return 'vendor-core';
						// }
						if (id.indexOf('/node_modules/element-plus/') !== -1 ||
							id.indexOf('/node_modules/@element-plus/icons-vue/') !== -1) {
							return 'vendor-element-plus';
						}
						if (id.indexOf('/node_modules/@kangc/') !== -1) {
							return 'vendor-markdown';
						}
						if (
							id.indexOf('node_modules/zrender/') !== -1 ||
							id.indexOf('node_modules/qs/') !== -1 ||
							id.indexOf('node_modules/dayjs/') !== -1 ||
							id.indexOf('node_modules/lodash-es/') !== -1
						) {
							return 'vendor-utils';
						}
						// 剩余的外部依赖全部装入 utils中
						// if (id.indexOf('/node_modules/') !== -1) {
						// 	return 'vendor-external';
						// }
					},
				},
			},
			sourcemap: false,
		},
		plugins: [
			compress({ threshold: 10240 }), // gzip 压缩
			// 打包分析
			visualizer({
				gzipSize: true,
				brotliSize: true,
				emitFile: false,
				filename: "stats.html", //分析图生成的文件名
				open: true //如果存在本地服务端口，将在打包后自动展示
			}),
			// markdownLoader(),
			vue(),
			// VueSetupExtend(),
			AutoImport({
				resolvers: [ElementPlusResolver()]
			}),
			Components({
				resolvers: [ElementPlusResolver()]
			})
		],
		// optimizeDeps: {
		// 	include: ['schart.js', 'lodash']
		// },
		css: {
			preprocessorOptions: {
				less: {
					modifyVars: {
						hack: `true; @import (reference) "${path.resolve("src/styles/variables.less")}";`,
					},
					javascriptEnabled: true,
				},
			},
			// PostCSS配置，添加浏览器前缀
			postcss: {
				plugins: [
					require('autoprefixer')({
						overrideBrowserslist: [
							'> 1%',           // 全球使用率大于1%的浏览器
							'last 2 versions', // 每个浏览器的最后2个版本
							'not dead',       // 不包含已经"死亡"的浏览器
							'ie >= 11',       // 支持IE11及以上
							'iOS >= 9',       // 支持iOS 9及以上
							'Android >= 4.4'  // 支持Android 4.4及以上
						],
						grid: true, // 启用CSS Grid布局前缀
					}),
					require('postcss-preset-env')({
						stage: 3, // 使用Stage 3阶段的CSS特性
						features: {
							'nesting-rules': true, // 启用嵌套规则
							'custom-properties': true, // 启用自定义属性
						},
					}),
				],
			},
		},
		// 现代浏览器构建优化
		esbuild: {
			// ES6+语法转换，确保兼容性
			target: 'es2020',
		},
	}
};