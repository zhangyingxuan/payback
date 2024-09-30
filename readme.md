# lerna 项目开发流程

## 项目创建

## 打包部署

1. 前端

```
pnpm build
上传至服务器
```

2. 后端

```
上传至服务器
如果有 package.json 更新，则执行 pnpm install
```

3. 核心 core

```
修改 package.json 版本号
检查 pnpm 源是否正确
pnpm build
pnpm publish
```

## 项目研发

1.  启动项目

- 启动前清理端口

```js
lsof -i:3000
kill -9 pid
```

- 启动项目

```
pnpm start:server
pnpm start:client
```

## 项目部署

1.  前端部署

2.  后端部署

3.  核心 core 部署
4.  mysql 数据库

## 项目运维

1. IO 监控（硬盘 IO 繁忙比率>90%重启 docker mysql 容器)

- 1.1 脚本编写

```
#!/bin/bash

# 获取MySQL容器的名称或ID
container_name_or_id="mysql"

# 判断容器是否存在
container_id=$(docker ps --filter "name=$container_name_or_id" --format "{{.ID}}")
if [ -z "$container_id" ]; then
  echo "MySQL容器未找到"
  exit 1
fi

# 获取MySQL容器的磁盘设备名
device_name=$(docker inspect --format '{{ .GraphDriver.Data.DeviceName }}' "$container_id")

# 使用iotop检查MySQL容器的IO占比，限制iotop运行时间为1秒
io_usage=$(timeout 1s iotop -P -b -n 1 -d 1 | grep "$device_name" | awk '{print $10}' | sed 's/%//')

# 判断IO占比是否大于90
if [ ! -z "$io_usage" ] && (( $(echo "$io_usage > 90" | bc -l) )); then
  echo "MySQL容器IO占比大于90%，正在重启容器"
  docker restart "$container_id"
fi
```

- 1.2 定时任务配置

```
执行 crontab -e

# 加入下面命令
*/2 7-23 * * * sh /usr/local/mysql/ioMonitorTaskIOTop.sh

日志存储到文件
*/2 7-23 * * * sh /usr/local/mysql/ioMonitorTaskIOTop.sh > /usr/local/mysql/ioMonitorTaskIOTop.log 2>&1 &

# 保存退出
```

2. mysql 数据备份
   2.1 脚本编写

```
#!/bin/bash

# MySQL 容器名称
CONTAINER_NAME="mysql"

# I/O 占比阈值
THRESHOLD=90

# 获取容器的 PID
CONTAINER_PID=$(docker inspect --format '{{.State.Pid}}' $CONTAINER_NAME)

echo "$CONTAINER_PID"
# 检查 I/O 占比
IO_USAGE=0
if [ -n "$CONTAINER_PID" ]; then
    echo "高 I/O 用量: $IO_USAGE%, start"
    # 使用 iotop 获取 I/O 占比
    IO_USAGE=$(iotop -p $CONTAINER_PID -b | awk 'NR==4 {print $8}')
    echo "高 I/O 用量: $IO_USAGE%, end"
fi

# 检查 I/O 占比是否超过阈值
if [ "$IO_USAGE" -ge "$THRESHOLD" ]; then
    echo "高 I/O 用量: $IO_USAGE%, 重启 MySQL container..."
    docker restart $CONTAINER_NAME
fi
```

- 2.2 定时任务配置

```
0 0 19 * 1-5 sh /usr/local/mysql/timerTask.sh
```

1. 前端异常监控 rum
2. 定时任务失败告警 企微机器人

## 服务器重启操作

1. 恢复 docker mysql 容器

```
docker start mysql
```

2. 重启 pm2 进程

```
pm2 start /workspace/git/pay-back/packages/server/dist/main.js --name=payBack --watch
```

3. 重启 nginx

```
nginx -s reload
```

无限未来 (Infinite Future)
数字前沿 (Digital Frontier)
云端智造 (Cloud Smart Manufacturing)
