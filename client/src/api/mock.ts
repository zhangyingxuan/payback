import request from '@/utils/request';

const baseUrl = '/pay-back';

export default {
  fetchShortTermData: (params: any) => {
    return request({
      url: `${baseUrl}/list`,
      method: 'get',
      params,
    });
  }
}
