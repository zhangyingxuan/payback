import { chromium, firefox, Page } from 'playwright';

const getBrowser = async () => {

  return await firefox.launch({
    // headless: false // setting this to true will not run the UI
  });;
};

export default {
  openPage: async (url: string) => {
    const browser = await getBrowser();
    // 打开股票行情页面  
    const page = await browser.newPage();
    // page.route('**/chart/get-robot-data', (route, request) => {
    //   const response = route.fulfill()
    //   console.log(response)
    //   // route.continue()
    // })


    await page.goto(url);
    // other actions...
    // await browser.close();
    return page;
  },
  /**
   * 
   * @param url 准备涨停数据
   * @returns 
   */
  prepareDataByUrl: async (url): Promise<Object[]> => {
    const browser = await getBrowser();
    // 打开股票行情页面  
    const page = await browser.newPage();
    return new Promise(async (resolve, reject) => {
      page.on('response', async response => {
        // console.log(response.url())
        if (response.url().includes('chart/get-robot-data') && response.status() === 200) {
          const dataJson = await response.json();
          const todayData = dataJson.data.answer[0].txt[0].content.components[0].data.datas;
          // 当天时间
          resolve(todayData);
        }
      })
      await page.goto(url);
    });
  },
}