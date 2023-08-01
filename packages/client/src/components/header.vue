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
        <el-button type="primary" @click="refreshTodayData" size="small">
          更新今日数据
        </el-button>
        <el-button
          type="warning"
          @click="synchronousOptionalStocks"
          size="small"
        >
          同步
        </el-button>

        <template v-if="!isMobile">
          <!-- 数据统计天数 5 10 15 20 -->
          <el-select
            v-model="sidebar.countDays"
            @change="onSelectChange"
            placeholder="统计周期"
            size="small"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- 用户头像 -->
          <el-avatar class="user-avator" :size="30" :src="imgurl" />
          <!-- 用户名下拉菜单 -->
          <el-dropdown
            class="user-name"
            trigger="click"
            @command="handleCommand"
          >
            <span class="el-dropdown-link">
              {{ username }}
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

  <MyDrawer :drawerVisible="drawerVisible" @closeDrawer="switchDrawerVisible" />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import MyDrawer from './drawer.vue';
import { useRouter } from 'vue-router';
import imgurl from '../assets/img/img.jpg';
import { crawlTodayData } from '../api/payBack';
import { modifyThsSelfStocks } from '../api/thsTrade';
import { clearLogin } from '../router/auth';
import { isMobile } from '@/core/util';
import { ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import Calendar from './calendar/index.vue';

const username: string | null = localStorage.getItem('ms_username');

// const countDays = ref(20);
const options = [
  {
    value: '5',
    label: '5天',
  },
  {
    value: '7',
    label: '7天',
  },
  {
    value: '10',
    label: '10天',
  },
  {
    value: '15',
    label: '15天',
  },
  {
    value: '20',
    label: '20天',
  },
  {
    value: '30',
    label: '30天',
  },
  {
    value: '45',
    label: '45天',
  },
];

// 当前日期大于20号，则提示
const monthEnd = dayjs().date() >= 20;
const sidebar = useSidebarStore();
const drawerVisible = ref(false);

function switchDrawerVisible() {
  drawerVisible.value = !drawerVisible.value;
}
function refreshTodayData() {
  ElMessageBox.confirm('确定要更新今日数据吗？')
    .then(() => {
      crawlTodayData();
    })
    .catch(() => {
      // catch error
    });
}

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
  .el-button {
    margin-right: 5px;
  }
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
  width: 400px;
  line-height: 40px;
}
.header-right {
  float: right;
  padding-right: 50px;
  .el-button {
    margin-right: 15px;
  }
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
</style>
