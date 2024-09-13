# lerna 项目开发流程

## 项目创建

## 打包部署

## 清理端口

```js
lsof -i:3000
kill -9 pid
```

## 启动项目

```
pnpm start:server
pnpm start:client
```

## 项目运维

1. IO 监控（硬盘 IO 繁忙比率>90%重启 docker mysql 容器)
2. mysql 数据备份
3. 前端异常监控 rum
4. 定时任务失败告警 企微机器人

## 服务器重启操作

1. 恢复 docker mysql 容器
2. 重启 pm2 进程
3. 重启 nginx

无限未来 (Infinite Future)
数字前沿 (Digital Frontier)
云端智造 (Cloud Smart Manufacturing)
