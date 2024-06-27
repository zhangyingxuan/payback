export const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isIOS = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad');

export const jsCallApp = () => {
  const sys: any = {},
    u = window.navigator.userAgent,
    ua = window.navigator.userAgent.toLowerCase();

  const config = {
    /*scheme:必须*/
    // scheme_IOS: 'IfInstalledCongMingTou://congmingtou',
    // scheme_Adr: 'cmt://splash',
    // assistant_url: 'www.you_downLload_url.com',
    scheme_IOS: 'weixin://',
    scheme_Adr: 'weixin://',
    assistant_url: 'http://baidu.com',
    timeout: 600,
  };

  sys.isWeixinBrowser = /micromessenger/.test(ua) ? true : false;
  sys.isQQBrowser = ua.match(/QQ/i)?.[0]?.toLowerCase() === 'qq';
  sys.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
  sys.isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  sys.isMobile = !!u.match(/AppleWebKit.*Mobile.*/);
  sys.isChrome = !!u.match(/chrome/);

  //友好的提示页面
  if (sys.isWeixinBrowser || sys.isQQBrowser) {
    console.log('weixin QQ');
    // $('.layer').show();
    return false;
  }

  const openIframe = document.createElement('iframe');
  openIframe.style.display = 'none';
  document.body.appendChild(openIframe);

  //ios
  if (sys.isiOS) {
    //由于部分ios中打开app后，WAP页面会被挂起，定时器不会被执行。因此可以做下优化：
    //WAP页重新被聚焦后，如果超过1s，认为APP被打开了，重新聚焦时就不必再跳转到APP下载页
    window.location.href = config.scheme_IOS; //ios scheme
    // const loadDateTime = Date.now();
    // setTimeout(function () {
    //   const timeOutDateTime = Date.now();
    //   if (timeOutDateTime - loadDateTime < 1000) {
    //     window.location.href = config.assistant_url;
    //   }
    // }, 25);
  } else if (sys.isAndroid) {
    //判断是否是android，具体的判断函数自行百度
    if (sys.isChrome) {
      //chrome浏览器用iframe打不开得直接去打开，算一个坑
      console.log('Chrome');
      window.location.href = config.scheme_Adr;
    } else {
      //app中打开
      console.log('Android');
      openIframe.src = config.scheme_Adr;
      console.log(config.scheme_Adr);
      //跳转assistant_url
      setTimeout(function () {
        window.location.href = config.assistant_url;
      }, 500);
    }
  } else {
    //主要是给winphone的用户准备的,实际都没测过，现在winphone不好找啊
    openIframe.src = config.scheme_Adr;
    setTimeout(function () {
      window.location.href = config.assistant_url;
    }, 500);
  }
}

export const updateNavThemeColor = (color: string) => {
  // 获取meta标签
  const meta: any = document.querySelector('meta[name="theme-color"]');
  // 修改颜色值
  meta && meta.setAttribute('content', color);
}