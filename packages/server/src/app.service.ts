import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async wait30s() {
    const data = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('成功！');
      }, 30000)
    })

    return 'Hello test!' + data;
  }
}
