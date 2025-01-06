import fetch from 'node-fetch';

export function createFetch(timeout = 60000) {
  return (resource, options: any = {}) => {
    const controller = new AbortController();
    options = options || {};
    options.signal = controller.signal;

    const timeoutId = setTimeout(() => {
      console.log(`${resource} 请求超时 ${timeout}ms`);
      controller.abort();
    }, timeout);

    return fetch(resource, options)
      .then(response => {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(error => {
        clearTimeout(timeoutId);
        throw error;
      });
  };
}
