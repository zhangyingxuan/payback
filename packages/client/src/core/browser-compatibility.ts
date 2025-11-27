/**
 * 浏览器兼容性检测工具
 * 提供浏览器兼容性检查和报告功能
 */

// 浏览器兼容性检测结果接口
export interface BrowserCompatibility {
  browser: string;
  version: string;
  isSupported: boolean;
  issues: string[];
  score: number; // 兼容性评分 0-100
}

// 支持的浏览器最低版本
const SUPPORTED_BROWSERS = {
  chrome: '58',
  firefox: '57',
  safari: '11',
  edge: '16',
  opera: '45',
  ie: '11'
};

// CSS特性支持检测
const CSS_FEATURES = {
  'backdrop-filter': 'CSS背景滤镜',
  'grid': 'CSS Grid布局',
  'flexbox': 'CSS Flexbox布局',
  'transform': 'CSS变换',
  'transition': 'CSS过渡动画',
  'custom-properties': 'CSS自定义属性',
  'viewport-units': '视口单位',
  'calc': 'CSS计算函数'
};

// JavaScript特性支持检测
const JS_FEATURES = {
  'es6': 'ES6语法支持',
  'promise': 'Promise支持',
  'fetch': 'Fetch API支持',
  'intersection-observer': 'Intersection Observer API',
  'local-storage': '本地存储',
  'session-storage': '会话存储',
  'web-workers': 'Web Workers'
};

/**
 * 检测浏览器信息
 */
export function detectBrowser(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  // Chrome检测
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1) {
    name = 'Chrome';
    version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  // Firefox检测
  else if (ua.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  // Safari检测
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  // Edge检测
  else if (ua.indexOf('Edge') > -1) {
    name = 'Edge';
    version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  // IE检测
  else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) {
    name = 'IE';
    version = ua.match(/(MSIE |rv:)([0-9.]+)/)?.[2] || 'Unknown';
  }
  // Opera检测
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR/') > -1) {
    name = 'Opera';
    version = ua.match(/(Opera|OPR)\/([0-9.]+)/)?.[2] || 'Unknown';
  }

  return { name, version };
}

/**
 * 检测CSS特性支持
 */
export function detectCSSFeatures(): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  Object.keys(CSS_FEATURES).forEach(feature => {
    switch (feature) {
      case 'backdrop-filter':
        results[feature] = CSS.supports('backdrop-filter', 'blur(10px)') ||
          CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
        break;
      case 'grid':
        results[feature] = CSS.supports('display', 'grid');
        break;
      case 'flexbox':
        results[feature] = CSS.supports('display', 'flex');
        break;
      case 'transform':
        results[feature] = CSS.supports('transform', 'translateX(10px)');
        break;
      case 'transition':
        results[feature] = CSS.supports('transition', 'all 0.3s ease');
        break;
      case 'custom-properties':
        results[feature] = CSS.supports('(--test: red)');
        break;
      case 'viewport-units':
        results[feature] = CSS.supports('height', '100vh');
        break;
      case 'calc':
        results[feature] = CSS.supports('width', 'calc(100% - 20px)');
        break;
      default:
        results[feature] = false;
    }
  });

  return results;
}

/**
 * 检测JavaScript特性支持
 */
export function detectJSFeatures(): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  Object.keys(JS_FEATURES).forEach(feature => {
    switch (feature) {
      case 'es6':
        results[feature] = typeof Symbol !== 'undefined' &&
          typeof Map !== 'undefined' &&
          typeof Set !== 'undefined';
        break;
      case 'promise':
        results[feature] = typeof Promise !== 'undefined';
        break;
      case 'fetch':
        results[feature] = typeof fetch !== 'undefined';
        break;
      case 'intersection-observer':
        results[feature] = 'IntersectionObserver' in window;
        break;
      case 'local-storage':
        results[feature] = 'localStorage' in window;
        break;
      case 'session-storage':
        results[feature] = 'sessionStorage' in window;
        break;
      case 'web-workers':
        results[feature] = 'Worker' in window;
        break;
      default:
        results[feature] = false;
    }
  });

  return results;
}

/**
 * 检查浏览器是否支持
 */
export function checkBrowserSupport(browserName: string, version: string): boolean {
  const normalizedName = browserName.toLowerCase();
  const minVersion = SUPPORTED_BROWSERS[normalizedName as keyof typeof SUPPORTED_BROWSERS];

  if (!minVersion) return false;

  const versionNum = parseFloat(version);
  const minVersionNum = parseFloat(minVersion);

  return !isNaN(versionNum) && versionNum >= minVersionNum;
}

/**
 * 生成兼容性报告
 */
export function generateCompatibilityReport(): BrowserCompatibility {
  const { name, version } = detectBrowser();
  const cssFeatures = detectCSSFeatures();
  const jsFeatures = detectJSFeatures();

  const isSupported = checkBrowserSupport(name, version);
  const issues: string[] = [];

  // 检查CSS特性支持
  Object.entries(cssFeatures).forEach(([feature, supported]) => {
    if (!supported) {
      issues.push(`不支持CSS特性: ${CSS_FEATURES[feature as keyof typeof CSS_FEATURES]}`);
    }
  });

  // 检查JavaScript特性支持
  Object.entries(jsFeatures).forEach(([feature, supported]) => {
    if (!supported) {
      issues.push(`不支持JavaScript特性: ${JS_FEATURES[feature as keyof typeof JS_FEATURES]}`);
    }
  });

  // 计算兼容性评分
  const totalFeatures = Object.keys(cssFeatures).length + Object.keys(jsFeatures).length;
  const supportedFeatures = Object.values(cssFeatures).filter(Boolean).length +
    Object.values(jsFeatures).filter(Boolean).length;
  const score = Math.round((supportedFeatures / totalFeatures) * 100);

  return {
    browser: name,
    version,
    isSupported,
    issues,
    score
  };
}

/**
 * 获取浏览器兼容性建议
 */
export function getCompatibilitySuggestions(report: BrowserCompatibility): string[] {
  const suggestions: string[] = [];

  if (!report.isSupported) {
    suggestions.push(`建议升级到${report.browser} ${SUPPORTED_BROWSERS[report.browser.toLowerCase() as keyof typeof SUPPORTED_BROWSERS]}或更高版本`);
  }

  if (report.score < 80) {
    suggestions.push('部分功能可能无法正常使用，建议使用现代浏览器');
  }

  if (report.browser === 'IE') {
    suggestions.push('Internet Explorer已停止支持，建议使用Microsoft Edge或其他现代浏览器');
  }

  if (report.issues.length > 0) {
    suggestions.push('检测到兼容性问题，部分功能可能受限');
  }

  return suggestions;
}

/**
 * 检查是否移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;
}

/**
 * 检查是否触摸设备
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0);
}

/**
 * 检查是否Safari浏览器
 */
export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * 初始化浏览器兼容性检查
 */
export function initBrowserCompatibility(): void {
  const report = generateCompatibilityReport();

  // 在控制台输出兼容性报告
  console.group('浏览器兼容性报告');
  console.log(`浏览器: ${report.browser} ${report.version}`);
  console.log(`支持状态: ${report.isSupported ? '✅ 支持' : '❌ 不支持'}`);
  console.log(`兼容性评分: ${report.score}/100`);

  if (report.issues.length > 0) {
    console.warn('兼容性问题:', report.issues);
  }

  const suggestions = getCompatibilitySuggestions(report);
  if (suggestions.length > 0) {
    console.info('建议:', suggestions);
  }

  console.groupEnd();

  // 添加全局兼容性信息
  (window as any).browserCompatibility = report;
}

// 默认导出兼容性检查函数
export default {
  detectBrowser,
  detectCSSFeatures,
  detectJSFeatures,
  checkBrowserSupport,
  generateCompatibilityReport,
  getCompatibilitySuggestions,
  isMobileDevice,
  isTouchDevice,
  isSafari,
  initBrowserCompatibility
};