# Builder6 Records API

## 快速开始

```
yarn add @builer6/server
yarn b6 start
```

## 环境变量

基本环境变量

```bash
B6_PORT=5100
B6_MONGO_URL=mongodb://127.0.0.1:27017/steedos
B6_TRANSPORTER=redis://127.0.0.1:6379
```
以上环境变量如未定义，会自动识别并转换 steedos 的环境变量。

## 插件

b6 server 支持在启动时自动安装软件包，动态加载服务。可使用淘宝镜像。

### 启动时自动安装nodejs软件包

```bash
# 启动时自动安装软件包
B6_PLUGIN_PACKAGES=@builder6/node-red,lodash
# 使用 淘宝源
B6_PLUGIN_NPMRC=registry=https://registry.npmmirror.com
```

### 启动时 自动加载 Moleculer 服务

```bash
# 启动时加载服务
B6_PLUGIN_SERVICES=@builder6/node-red
```

启动服务时，会自动查找所有服务类插件，如果找到 `package.service.js` 则作为 moleculer 服务加载。


### 启动时 自动加载 Nestjs Module

```bash
# 启动时加载 NestJS Module
B6_PLUGIN_MODULE=@builder6/node-red
```

启动服务时，会自动查找所有module类插件，如果找到 `dist/plugin.modules.js` 则作为 nestjs module 加载。



## Nestjs configService

系统会自动识别 B6_ 和 STEEDOS_ 开头的环境变量，转换为 nestjs configService 配置。

例如：以下命令可以获得 `B6_MONGO_URL` 的值。

```js
configService.get('mongo.url');
```

## 启动开发服务

```bash
yarn 
yarn start:dev
```

## 编译并监听插件包

```bash
yarn build:watch
```

## 发版本

```bash
npm login
npm release --access public
```

