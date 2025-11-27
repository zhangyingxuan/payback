import { UserConfigExport, loadEnv, ConfigEnv } from 'vite';
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
// 暂时注释 该插件，便于调试，该插件用于 steup语法糖下 按组件name 区分
// import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// import markdownLoader from './build/markdownLoader';
import { warpperEnv } from "./build";
import path from 'path';
import compress from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
// 移除有问题的插件
// import { manualChunksPlugin } from 'vite-plugin-webpackchunkname';


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
		// 依赖预构建优化
		optimizeDeps: {
			include: [
				'vue',
				'vue-router',
				'pinia',
				'axios',
				'dayjs',
				'qs',
				'js-cookie'
			],
			exclude: ['echarts', '@kangc/v-md-editor']
		},
		// 打包优化，vender 拆分为多个
		build: {
			outDir: path.resolve(__dirname, 'dist'),
			emptyOutDir: true,
			// 启用更小的chunk大小警告阈值
			chunkSizeWarningLimit: 800,
			rollupOptions: {
				// input: viteMultiPages,
				output: {
					// 更细粒度的代码分割
					manualChunks: (id) => {
						// Element Plus 相关依赖
						if (id.includes('/node_modules/element-plus/') ||
							id.includes('/node_modules/@element-plus/icons-vue/')) {
							return 'vendor-element-plus';
						}
						// ECharts 相关依赖
						if (id.includes('/node_modules/echarts/') ||
							id.includes('/node_modules/zrender/')) {
							return 'vendor-echarts';
						}
						// // Markdown 编辑器相关
						// if (id.includes('/node_modules/@kangc/v-md-editor/') ||
						// 	id.includes('/node_modules/hyperdown/')) {
						// 	return 'vendor-markdown';
						// }
						// // Vue 核心相关
						// if (id.includes('/node_modules/vue/') ||
						// 	id.includes('/node_modules/@vue/') ||
						// 	id.includes('/node_modules/vue-router/') ||
						// 	id.includes('/node_modules/pinia/')) {
						// 	return 'vendor-vue';
						// }
						// 工具库
						if (id.includes('/node_modules/lodash-es/') ||
							id.includes('/node_modules/dayjs/') ||
							id.includes('/node_modules/qs/') ||
							id.includes('/node_modules/axios/')) {
							return 'vendor-utils';
						}
						// // 图片处理相关
						// if (id.includes('/node_modules/cropperjs/') ||
						// 	id.includes('/node_modules/vue-cropperjs/')) {
						// 	return 'vendor-image';
						// }
						// 其他第三方库
						// if (id.includes('/node_modules/')) {
						// 	return 'vendor-other';
						// }
					},
					// 更优化的chunk命名
					chunkFileNames: 'assets/[name]-[hash].js',
					entryFileNames: 'assets/[name]-[hash].js',
					assetFileNames: 'assets/[name]-[hash].[ext]'
				},
			},
			sourcemap: false,
			// 启用更小的构建目标
			target: 'es2020',
			// 启用更小的polyfill策略
			modulePreload: {
				polyfill: false
			},
			// 使用esbuild进行压缩，避免terser依赖问题
			minify: 'esbuild',
		},
		plugins: [
			compress({
				threshold: 10240,
				// 启用更多压缩算法
				algorithm: 'gzip',
				ext: '.gz',
				deleteOriginFile: false
			}),
			// 移除有问题的插件调用
			// manualChunksPlugin(), // 合并webpackChunkName
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
				resolvers: [ElementPlusResolver()],
				// 优化自动导入
				dts: true,
				imports: ['vue', 'vue-router', 'pinia']
			}),
			Components({
				resolvers: [ElementPlusResolver()],
				// 优化组件导入
				dts: true
			})
		],
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