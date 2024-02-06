import { exec } from 'child_process';
const net = require('net');

function getAvailablePort(port, isGetNewPort = false) {
  const server = net.createServer().listen(port);
  return new Promise((resolve, reject) => {
    // 如果监听成功，表示端口没有被其他服务占用，端口可用，取消监听，返回端口给调用者。
    server.on('listening', () => {
      console.log('the server is running on port ' + port);
      server.close();
      resolve(port);
    });
    // 如果监听出错，端口+1，继续监听，直到监听成功。
    server.on('error', async (err: any) => {
      if (err.code === 'EADDRINUSE') {
        if (isGetNewPort) {
          resolve(getAvailablePort(port + 1));
        } else {
          await killProcessOnPort(port);
          resolve(port);
        }
        console.log('this port ' + port + ' is occupied try another.');
      } else {
        reject(err);
      }
    });
  });
}

// 杀死特定端口的进程
function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    exec(`lsof -t -i tcp:${port}`, (error, stdout, stderr) => {
      if (error) {
        console.error('lsof -t -i tcp:', error);
        reject(error);
        return;
      }
      const pid = stdout.trim();
      if (pid) {
        exec(`kill -9 ${pid}`, killError => {
          if (killError) {
            console.error('Error killing process:', killError);
            reject(error);
          } else {
            console.log(`Killed process ${pid} on port ${port}`);
            resolve(port);
          }
        });
      } else {
        console.log(`No process found on port ${port}`);
        resolve(port);
      }
    });
  });
}

export { getAvailablePort };
