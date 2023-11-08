import { UserConfigExport, loadEnv, ConfigEnv } from 'vite';
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import markdownLoader from './build/markdownLoader';
import { warpperEnv } from "./build";
import path from 'path';
import compress from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { manualChunksPlugin } from 'vite-plugin-webpackchunkname';


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
	const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_BASE_API_THS, VITE_BASE_API } =
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
			}
		},
		// 打包优化，vender 拆分为多个
		build: {
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
			terserOptions: {
				compress: {
					// 生产环境时移除console
					drop_console: true,
					drop_debugger: true,
				},
			},
			sourcemap: false,
		},
		plugins: [
			compress({ threshold: 10240 }), // gzip 压缩
			manualChunksPlugin(), // 合并webpackChunkName
			visualizer({
				gzipSize: true,
				brotliSize: true,
				emitFile: false,
				filename: "stats.html", //分析图生成的文件名
				open: true //如果存在本地服务端口，将在打包后自动展示
			}), // 打包分析
			markdownLoader(),
			vue(),
			VueSetupExtend(),
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
		},
	}
};