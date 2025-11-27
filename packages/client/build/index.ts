/** 环境变量类型定义 */
type ViteEnv = {
  VITE_PORT: number;
  VITE_PUBLIC_PATH: string;
  VITE_ROUTER_HISTORY: string;
  VITE_CDN: boolean;
  VITE_COMPRESSION: string;
  VITE_BASE_API: string;
  VITE_BASE_API_THS: string;
  VITE_BASE_API_THS_NEWS: string;
  VITE_BASE_API_THS_DQ: string;
  [key: string]: any;
};

type Recordable<T = any> = Record<string, T>;

/** 处理环境变量 */
const warpperEnv = (envConf: Recordable): ViteEnv => {
  /** 此处为默认值 */
  const ret: any = {
    VITE_PORT: 8848,
    VITE_PUBLIC_PATH: "",
    VITE_ROUTER_HISTORY: "",
    VITE_CDN: false,
    VITE_COMPRESSION: "none",
    VITE_BASE_API: "",
    VITE_BASE_API_THS: "",
    VITE_BASE_API_THS_NEWS: "",
    VITE_BASE_API_THS_DQ: "",
  };

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName =
      realName === "true" ? true : realName === "false" ? false : realName;

    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }
    ret[envName] = realName;
    if (typeof realName === "string") {
      process.env[envName] = realName;
    } else if (typeof realName === "object") {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
};

/** 获取环境变量 */
const loadEnv = (): ViteEnv => {
  return import.meta.env;
};

export { warpperEnv, loadEnv };
