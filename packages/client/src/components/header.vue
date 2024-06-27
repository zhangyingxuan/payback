<template>
  <div :class="['header', { monthEnd }]">
    <template v-if="!isMobile">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="collapseChage">
        <el-icon v-if="sidebar.collapse"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </div>
      <div class="logo">
        <Calendar />
      </div>
    </template>
    <div :class="isMobile ? 'mobile-right' : 'header-right'">
      <div class="header-user-con">
        <el-button type="primary" @click="switchDrawerVisible" size="small">
          我的收藏
        </el-button>

        <el-button v-isAdmin type="danger" @click="fetchTodayData" size="small">
          <!-- @click="data.fetchTodayDataDialogVisible = true" -->
          更新全部数据
        </el-button>
        <el-button
          v-isAdmin
          type="warning"
          @click="synchronousOptionalStocks"
          size="small"
        >
          同步
        </el-button>

        <!-- 数据统计天数 5 10 15 20 -->
        <el-select
          class="select"
          v-model="sidebar.countDays"
          @change="onSelectChange"
          placeholder="统计周期"
          size="small"
        >
          <el-option
            v-for="item in options"
            :key="item"
            :label="item + '日'"
            :value="item"
          />
        </el-select>
        <template v-if="!isMobile">
          <el-switch
            v-model="sidebar.isAutoRefresh"
            inline-prompt
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
            active-text="自动刷新"
            inactive-text="关闭刷新"
          />
          <!-- 用户头像 -->
          <el-avatar class="user-avator" :size="30" :src="imgurl" />
          <!-- 用户名下拉菜单 -->
          <el-dropdown
            class="user-name"
            trigger="click"
            @command="handleCommand"
          >
            <span class="el-dropdown-link">
              {{ permiss.name }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <a
                  href="https://gitee.com/chongqing-woteng/vue3-element-plus-vite4"
                  target="_blank"
                >
                  <el-dropdown-item>项目仓库</el-dropdown-item>
                </a>
                <!-- <el-dropdown-item command="user">个人中心</el-dropdown-item> -->
                <el-dropdown-item divided command="loginout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </div>

  <!-- 改为默认更新所有数据，去除二次确认 -->
  <!-- <el-dialog
    v-model="data.fetchTodayDataDialogVisible"
    :close-on-click-modal="false"
    title="是否更新今日数据？"
    :width="isMobile ? '70%' : '30%'"
  >
    <el-form label-width="120px">
      <el-form-item label="更新范围">
        <el-select
          v-model="data.fetchTodayDataType"
          placeholder="请选择更新数据范围"
        >
          <el-option label="全部数据" :value="0" />
          <el-option label="短线数据" :value="1" />
          <el-option label="市场数据" :value="2" />
          <el-option label="资金数据" :value="3" />
          <el-option label="竞价数据" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="删除不及预期" v-if="data.fetchTodayDataType === 4">
        <el-switch
          v-model="data.isRemoveIncompatible"
          inline-prompt
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.fetchTodayDataDialogVisible = false"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="fetchTodayData"
          :loading="data.fetchTodayDataing"
        >
          确认
        </el-button>
      </span>
    </template>
  </el-dialog> -->

  <MyDrawer
    :drawerVisible="data.drawerVisible"
    @closeDrawer="switchDrawerVisible"
  />
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { debounce } from 'lodash-es';
import { useSidebarStore } from '../store/sidebar';
import MyDrawer from './drawer.vue';
import { useRouter } from 'vue-router';
import imgurl from '../assets/img/img.jpg';
import { crawlTodayData } from '@/api/payBack';
import { modifyThsSelfStocks } from '../api/thsTrade';
import { clearLogin } from '../router/auth';
import { isMobile } from '@/core/util';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import Calendar from './calendar/index.vue';
import { usePermissStore } from '../store/permiss';
import { updateNavThemeColor } from '@/core/util';

// 当前日期大于20号，则提示
const monthEnd = dayjs().date() >= 20;

updateNavThemeColor(monthEnd ? '#224c15' : '#242f42');

const options = [7, 15, 20, 40, 60, 120, 240];
const permiss = usePermissStore();

let loadingMessage: any = null;

const data = reactive({
  drawerVisible: false,
  fetchTodayDataDialogVisible: false,
  fetchTodayDataType: 0,
  fetchTodayDataing: false,
  isRemoveIncompatible: 0,
});

// const countDays = ref(20);

const sidebar = useSidebarStore();

function switchDrawerVisible() {
  data.drawerVisible = !data.drawerVisible;
}

const fetchTodayData = debounce(async () => {
  loadingMessage && loadingMessage.close();
  // 提示加载中
  loadingMessage = ElMessage({
    duration: 0,
    message: '全部数据更新中...',
    type: 'warning',
  });
  try {
    // 根据更新范围，调用对应接口
    await crawlTodayData({
      // 更新全部数据
      fetchTodayDataType: data.fetchTodayDataType,
      // isRemoveIncompatible 为true 传1 否则传0
      isRemoveIncompatible: data.isRemoveIncompatible ? 1 : 0,
    });
    ElMessage.success('更新成功！');
    location.reload();
  } catch (e: any) {
    console.log(e);
    ElMessage.success('更新失败！');
  } finally {
    loadingMessage.close();
  }
}, 500);

function synchronousOptionalStocks() {
  ElMessageBox.confirm('确定要同步自选个股吗？')
    .then(() => {
      modifyThsSelfStocks();
    })
    .catch(() => {
      // catch error
    });
}

// 侧边栏折叠
const collapseChage = () => {
  sidebar.handleCollapse();
};
const onSelectChange = (val: any) => {
  sidebar.updateCountDays(val);
};

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
});

// 用户名下拉菜单选择事件
const router = useRouter();
const handleCommand = (command: string) => {
  if (command == 'loginout') {
    clearLogin();
    router.push('/login');
  } else if (command == 'user') {
    router.push('/user');
  }
};
</script>
<style scoped lang="less">
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  font-size: 22px;
  color: #fff;

  &.monthEnd {
    background-color: #224c15;
  }
}
.mobile-right {
  padding: 0 5px;
  overflow: auto;
}
.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  float: left;
  padding: 0 21px;
  cursor: pointer;
}
.header .logo {
  display: flex;
  float: left;
  width: 330px;
  line-height: 40px;
}
.header-right {
  float: right;
  padding-right: 20px;
}
.header-user-con {
  display: flex;
  height: 40px;
  align-items: center;
}
.btn-fullscreen {
  transform: rotate(45deg);
  margin-right: 5px;
  font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
  position: relative;
  width: 30px;
  height: 30px;
  text-align: center;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.btn-bell-badge {
  position: absolute;
  right: 4px;
  top: 0px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #f56c6c;
  color: #fff;
}
.btn-bell .el-icon-lx-notice {
  color: #fff;
}
.user-name {
  margin-left: 10px;
}
.user-avator {
  margin-left: 20px;
  /deep/ img {
    width: 30px;
    height: 30px;
  }
}
.el-dropdown-link {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.el-dropdown-menu__item {
  text-align: center;
}
.select {
  width: 80px;
  margin: 0 15px;
}
</style>
