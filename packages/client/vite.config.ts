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
// vite-plugin-webpackchunkname 不兼容 Vite 7，已移除


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
		// 打包优化，vender 拆分为多个
		build: {
			outDir: path.resolve(__dirname, 'dist'),
			emptyOutDir: true,
			rollupOptions: {
				// input: viteMultiPages,
				output: {
					// 自定义 chunk 文件名格式
					chunkFileNames: (chunkInfo) => {
						// 保持 vendor、common、page 开头的 chunk 名称不变
						if (
							chunkInfo.name.startsWith('vendor-') ||
							chunkInfo.name.startsWith('common-') ||
							chunkInfo.name.startsWith('page-')
						) {
							return `assets/${chunkInfo.name}-[hash].js`;
						}
						return 'assets/[name]-[hash].js';
					},
					// 入口文件命名
					entryFileNames: 'assets/[name]-[hash].js',
					// 静态资源命名
					assetFileNames: 'assets/[name]-[hash].[ext]',
					manualChunks: (id) => {
						// ============ 第三方依赖分包策略 ============

						// 1. Vue 核心库及其紧密依赖（首屏必需，必须同步加载）
						// 注意：vue-demi、@vueuse、vue-* 等库依赖 Vue 的响应式系统，必须与 Vue 一起打包
						if (
							id.includes('/node_modules/vue/') ||
							id.includes('/node_modules/@vue/') ||
							id.includes('/node_modules/vue-router/') ||
							id.includes('/node_modules/vue-demi/') ||
							id.includes('/node_modules/@vueuse/') ||
							id.includes('/node_modules/pinia/') ||
							id.includes('/node_modules/vuex/') ||
							// 匹配所有 vue- 开头的库（如 vue-cropperjs, vue-schart 等）
							/\/node_modules\/vue-[^/]+\//.test(id)
						) {
							return 'vendor-vue';
						}

						// 2. Element Plus UI 库（按需加载的组件会自动拆分）
						if (
							id.includes('/node_modules/element-plus/') ||
							id.includes('/node_modules/@element-plus/')
						) {
							return 'vendor-element-plus';
						}

						// 3. 图表库（仅 charts 页面需要）
						if (id.includes('/node_modules/echarts/')) {
							return 'vendor-echarts';
						}
						if (id.includes('/node_modules/zrender/')) {
							return 'vendor-zrender';
						}

						// 4. Markdown 编辑器（仅 article 页面需要）
						if (id.includes('/node_modules/@kangc/')) {
							return 'vendor-markdown';
						}

						// 5. 常用工具库（多页面共享）
						if (
							id.includes('/node_modules/axios/') ||
							id.includes('/node_modules/qs/') ||
							id.includes('/node_modules/dayjs/') ||
							id.includes('/node_modules/lodash-es/') ||
							id.includes('/node_modules/lodash/')
						) {
							return 'vendor-utils';
						}

						// 6. 其他 node_modules 依赖统一打包
						if (id.includes('/node_modules/')) {
							return 'vendor-libs';
						}

						// ============ 页面级代码分包策略 ============
						// 策略：只对 views 下的直接子目录中的 .vue 入口文件进行聚合
						// 对于 components/ 等子目录，不做强制聚合，让 Rollup 自动处理以避免循环依赖

						// 匹配 /src/views/{pageName}/*.vue（直接子文件，非嵌套目录）
						const directViewMatch = id.match(/\/src\/views\/([^/]+)\/[^/]+\.vue$/);
						if (directViewMatch) {
							return `page-${directViewMatch[1]}`;
						}

						// // ============ 公共模块分包 ============

						// // 公共组件
						// if (id.includes('/src/components/')) {
						// 	return 'common-components';
						// }

						// // 公共工具函数
						// if (id.includes('/src/utils/') || id.includes('/src/hooks/')) {
						// 	return 'common-utils';
						// }

						// // Store 状态管理
						// if (id.includes('/src/store/')) {
						// 	return 'common-store';
						// }

						// // API 接口
						// if (id.includes('/src/api/')) {
						// 	return 'common-api';
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
			// 1. 生成 .gz 文件
			compress({
				algorithm: 'gzip',
				ext: '.gz',
				threshold: 10240, // 超过 10kb 才压缩
				deleteOriginFile: false // 切记：不要删除源文件！
			}),
			// 2. 生成 .br 文件
			compress({
				algorithm: 'brotliCompress',
				ext: '.br',
				threshold: 10240,
				deleteOriginFile: false
			}),
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
		optimizeDeps: {
			// include: ['schart.js', 'lodash'],
			exclude: ['pay-back-core']
		},
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