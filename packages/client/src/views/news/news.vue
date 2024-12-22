<template>
  <div class="news__container">
    <!-- 头部 -->
    <div class="news_header">
      <div class="">
        <div class="newsTit" style="margin-right: 250px">
          7×24小时要闻直播
          <div class="triangle trangle6"></div>
        </div>
      </div>
      <div class="flex__row opt_col">
        <el-button type="primary" @click="clearOutdatedNews" size="small">
          仅保留今日新闻
        </el-button>
        <el-button type="danger" @click="clearAllNews" size="small">
          清除所有
        </el-button>
        <el-checkbox v-model="autoRefreshInterval">自动刷新 </el-checkbox>
        <div
          v-loading="data.loading"
          element-loading-custom-class="autoRefreshLoading"
        ></div>
      </div>
    </div>
    <ul class="newsList">
      <li v-for="(item, index) in data.newsList" :key="index">
        <div class="news_item_time">
          <div>
            {{ dayjs(new Date(+item.ctime * 1000)).format('HH:mm:ss') }}
          </div>
          <div class="news_item_date">
            {{ dayjs(new Date(+item.ctime * 1000)).format('MM月DD日') }}
          </div>
        </div>
        <div class="news_item_detail" @click="goDetail(item.url)">
          <span class="title">
            【<span v-html="prepareTitle(item.title)"></span>】
            <el-tag type="info" size="small"> {{ item.tag }}</el-tag>
          </span>
          <span class="content">{{ item.digest }}</span>
          <div
            class="news_item_tags"
            v-if="
              item.tag &&
              (item.tag.includes('A股') || item.tag.includes('异动'))
            "
          >
            <Plate
              v-for="(field, index) in item.field"
              :key="index"
              :name="field.name"
              :code="field.stockCode"
              class="news_item_tags"
              style="margin-right: 20px"
            />
            <Stock
              v-for="(stock, index) in item.stock"
              :key="index"
              :name="stock.name"
              :code="stock.stockCode"
            />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onBeforeUnmount } from 'vue';
import { fetchThsNews, fetchThsAllNews } from '@/api/tonghuashun';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import Axios from 'axios';

const { CancelToken } = Axios;
const localstorageKey_newsInfo = 'newsInfo';

interface NewsItem {
  title: string;
  digest: string;
  ctime: string;
  url: string;
  field: any[];
  stock: any[];
  tag: string;
}
interface NewsInfo {
  latestTime: string;
  newsList: NewsItem[];
  loading: boolean;
}
// 由于同花顺无法过滤非重磅消息，所以自己开发过滤规则，则页面中可直接加自选股票功能
// 新闻消息有时效性，仅当日有效；无需长存，直接缓存localStorage即可
const data: NewsInfo = reactive({
  latestTime: Math.round(new Date().getTime() / 1000).toString(),
  // latestTime: '1730948531', //Math.round(new Date().getTime() / 1000).toString(),
  newsList: [],
  loading: false,
});

const autoRefreshInterval = ref(true);
let interval: any = null;
let source: any = CancelToken.source();

/**
 * 准备消息内容，涨跌 关键字颜色标注
 * @param tags
 * @param baseUrl
 * @returns
 */
const prepareTitle = (newsTitle: string) => {
  const replaceRegZhang = new RegExp('涨', 'ig');
  const replaceRegDie = new RegExp('跌', 'ig');
  const replaceStringZhang = `<span class="red">涨</span>`;
  const replaceStringDie = `<span class="green">跌</span>`;
  newsTitle = newsTitle.replace(replaceRegZhang, replaceStringZhang);
  newsTitle = newsTitle.replace(replaceRegDie, replaceStringDie);

  return newsTitle;
};
/**
 * 过滤重要消息，并返回最新时间
 * @param list
 * @returns
 */
const importantNewsFilter = (list: any[], latestTime: string) => {
  const needPushNews: any[] = [];

  // 取出重要消息进行推送
  list &&
    list.forEach((news, i) => {
      if (i === 0) {
        latestTime = news.ctime;
      }
      // color 为 '2'，重要消息
      if (news.color === '2') {
        needPushNews.push(news);
      }
    });

  return { newsList: needPushNews, latestTime };
};
/**
 * 刷新新闻列表
 */
const refreshNews = async () => {
  // 取消请求机制，应对重复请求 2024-11-12
  source.cancel('Request canceled due to timeout');
  source = CancelToken.source();
  data.loading = true;
  // 获取新闻列表
  // 这里可以用接口请求数据，也可以用本地数据
  try {
    const newsData = await fetchThsNews(data.latestTime, source);
    const result = importantNewsFilter(newsData.list, data.latestTime);
    data.newsList = result?.newsList.concat(data.newsList);
    data.latestTime = result.latestTime;
    // 更新缓存数据
    localStorage.setItem(localstorageKey_newsInfo, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  } finally {
    data.loading = false;
  }
};
watch(
  autoRefreshInterval,
  async val => {
    clearInterval(interval);
    if (val) {
      refreshNews();
      // 避免接口阻塞一直调用，等待收到结果后再刷新
      interval = setInterval(async () => {
        refreshNews();
      }, 5000);
    }
  },
  { immediate: true },
);

/**
 * 销毁时清理定时任务
 */
onBeforeUnmount(() => {
  clearInterval(interval);
});

const goDetail = (url: string) => {
  window.open(url, '_blank');
};
const clearAllNews = () => {
  localStorage.setItem(localstorageKey_newsInfo, '[]');
  data.newsList = [];
};
/**
 * 清理过期新闻（非今日数据）
 */
const clearOutdatedNews = () => {
  // 清理过期新闻数据
  const newsInfo: NewsInfo = JSON.parse(
    localStorage.getItem(localstorageKey_newsInfo) || '{}',
  );

  if (newsInfo.newsList && newsInfo.newsList.length > 0) {
    const newsList = newsInfo.newsList;
    // 清理出非今日数据
    data.newsList = newsList.filter(item => judgeIsToday(item.ctime));
    localStorage.setItem(
      localstorageKey_newsInfo,
      JSON.stringify({ newsList: data.newsList, latestTime: data.latestTime }),
    );
  }

  ElMessage({
    showClose: true,
    message: '已清理过期新闻',
    type: 'success',
  });
};

/**
 *  判断时间戳是否属于今日
 * @param timestamp
 */
const judgeIsToday = (timestamp: string) => {
  if (!timestamp) return true;
  // 使用 dayjs 转换时间戳
  const date = dayjs(new Date(+timestamp * 1000));
  // 获取今天的日期（不含时间）
  const today = dayjs().startOf('day');
  // 判断时间戳是否属于今日
  return date.isSame(today, 'day');
};
/**
 * 初始化页面
 */
const initPage = async () => {
  // 获取缓存数据
  const newsInfo: NewsInfo = JSON.parse(
    localStorage.getItem(localstorageKey_newsInfo) || '{}',
  );

  data.latestTime = newsInfo.latestTime;
  // 如果没有当日数据，则获取最新20条
  if (!newsInfo.newsList || newsInfo.newsList.length === 0) {
    const newsData = await fetchThsAllNews();
    const result = importantNewsFilter(newsData.list, data.latestTime);
    data.newsList = result?.newsList;
    data.latestTime = result.latestTime;
    // 更新缓存数据
    localStorage.setItem(localstorageKey_newsInfo, JSON.stringify(data));
  } else {
    data.newsList = newsInfo.newsList || [];
  }
};

initPage();
</script>

<style scoped lang="less">
.news__container {
  .newsTit {
    width: 169px;
    height: 31px;
    line-height: 31px;
    margin-bottom: -1px;
    background-color: #cf0f0f;
    color: #fff;
    text-align: center;
    font-size: 18px;
    float: left;
    position: relative;
    margin-right: 320px;

    .trangle6 {
      left: 6px;
      top: 31px;
    }
    .triangle {
      border-width: 5px;
      border-color: #cf0f0f transparent transparent transparent;
      border-style: solid dashed dashed dashed;
      position: absolute;
    }
  }
  .opt_col {
    justify-items: center;
    align-items: center;

    .el-checkbox {
      margin-left: 12px;
    }
  }
  .news_header {
    border-bottom: 1px solid #e6e6e6;
  }

  .newsList {
    margin-bottom: 10px;
    display: block;
    list-style-type: disc;
    padding: 0 40px;
    unicode-bidi: isolate;

    li {
      border-bottom: 1px solid #e6e6e6;
      padding-top: 10px;
      padding-bottom: 5px;
      overflow: hidden;
      display: flex;
    }

    .news_item_date {
      font-size: 12px;
      color: #aaa;
    }
    .news_item_time {
      font-size: 14px;
      min-width: 120px;
      color: #999;
    }
    .news_item_detail {
      display: block;
      margin-top: 5px;
      font-size: 14px;
      line-height: 24px;
      color: #333;
      cursor: pointer;
      font-size: 16px;

      .title {
        font-weight: bold;
        margin-right: 5px;
      }
    }

    .news_item_tags {
      font-size: 12px;
      padding-left: 10px;
      color: @blue;

      > span {
        display: inline-block;
        margin-right: 10px;
      }
    }
  }
}
</style>
<style>
.autoRefreshLoading {
  .el-loading-spinner .circular {
    width: 40px;
    height: 40px;
  }
}
</style>
