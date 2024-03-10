import { defineStore } from 'pinia';

interface ObjectList {
  [key: string]: string[];
}
interface UserInfo {
  name: string;
  account: string;
  isAdmin: boolean;
}

export const usePermissStore = defineStore('permiss', {
  state: () => {
    return {
      key: <any>[],
      defaultList: <ObjectList>{
        admin: [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16'
        ],
        user: ['1', '2', '3', '11', '13', '14', '15']
      },
      isAdmin: false,
      name: '',
      account: ''
    };
  },
  actions: {
    handleSetUserInfo(userInfo: UserInfo) {
      const keys: Array<string> = this.defaultList[userInfo.isAdmin ? 'admin' : 'user'];
      this.key = keys;
      this.name = userInfo.name;
      this.account = userInfo.account;
      this.isAdmin = userInfo.isAdmin;
    }
  },
  // 3. 配置持久化策略
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       storage: localStorage, paths: ['key', 'isAdmin', 'name', 'account']
  //     }, // count,name存储在sessionStorage
  //     // { storage: sessionStorage, paths: ['token'] }
  //   ]
  // }
});
