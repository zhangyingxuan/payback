import { defineStore } from 'pinia';

export const username: string | null = localStorage.getItem('ms_username');
export const isAdmin = username === 'admin';

interface ObjectList {
  [key: string]: string[];
}

export const usePermissStore = defineStore('permiss', {
  state: () => {
    const keys = localStorage.getItem('ms_keys');
    return {
      key: keys ? JSON.parse(keys) : <string[]>[],
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
    };
  },
  actions: {
    handleSet(val: string[], userName: string) {
      this.key = val;
      this.isAdmin = userName === 'admin';
    }
  }
});
