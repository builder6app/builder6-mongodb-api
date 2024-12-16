# Builder6 Records API

## 配置环境变量

```bash
ROOT_URL=http://localhost:5100
B6_PORT=5100
MONGO_URL=mongodb://127.0.0.1:27017/steedos
TRANSPORTER=redis://127.0.0.1:6379
```

## 启动开发服务

```bash
yarn 
yarn start:dev
```

## 编译 

```bash
yarn build
```

## 编译并监听

```bash
yarn build:watch
```

## 发版本

```bash
npm login
npm release --access public
```

## 插件

支持在启动时自动安装软件包，动态加载服务。可使用淘宝镜像。

```bash
# 启动时自动安装软件包
B6_PLUGIN_PACKAGES=@builder6/node-red,lodash
# 启动时加载服务，此服务不需在 PACKAGES 中，单需已安装。
B6_PLUGIN_SERVICES=@builder6/node-red
# 使用 淘宝员
B6_PLUGIN_NPMRC=registry=https://registry.npmmirror.com
```