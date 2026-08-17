import fetch from 'node-fetch';

const retryableStatus = new Set([429, 500, 502, 503, 504]);

export function createFetch(timeout = 60000, maxAttempts = 3) {
  return async (resource, options: any = {}) => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const requestOptions = { ...(options || {}), signal: controller.signal };
      const timeoutId = setTimeout(() => {
        console.log(`${resource} 请求超时 ${timeout}ms`);
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(resource, requestOptions);
        clearTimeout(timeoutId);

        if (!retryableStatus.has(response.status) || attempt === maxAttempts) {
          return response;
        }

        await response.arrayBuffer();
        lastError = new Error(`请求失败: HTTP ${response.status}`);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        if (attempt === maxAttempts) {
          throw error;
        }
      }

      await new Promise<void>(resolve => setTimeout(resolve, 500 * attempt));
    }

    throw lastError;
  };
}
