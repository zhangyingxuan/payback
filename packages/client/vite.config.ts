import { UserConfigExport, loadEnv, ConfigEnv } from 'vite';
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { warpperEnv } from "./build";
import path from 'path';
import markdownLoader from './build/markdownLoader'

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
		plugins: [
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
		optimizeDeps: {
			include: ['schart.js', 'lodash']
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