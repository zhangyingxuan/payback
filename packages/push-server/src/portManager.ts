import { createServer } from 'http';

function getAvailablePort(port) {
  console.log('error1', port);
  return new Promise((resolve, reject) => {
    const server = createServer();
    server
      .listen(port)
      .on('listening', () => resolve(port))
      .on('error', () => {
        console.log('error2', port);
        server.close();
        if (port === port + 10) {
          // 防止无限循环，设定一个最大尝试次数
          reject(new Error('No available ports found'));
        }
        resolve(getAvailablePort(port + 1));
      });
  });
}

// 杀死特定端口的进程
export { getAvailablePort };
