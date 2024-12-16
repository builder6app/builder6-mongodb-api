# Builder6 Records API

## 配置环境变量

```bash
B6_ROOT_URL=http://localhost:5100
B6_PORT=5100
B6_MONGO_URL=mongodb://127.0.0.1:27017/steedos
B6_TRANSPORTER=redis://127.0.0.1:6379
```
以上环境变量如未定义，会自动识别并转换 steedos 的环境变量。


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

### 插件服务

定义插件服务时，会自动查找 `dist/package.service.js` 作为 moleculer 服务加载。

## 与 Steedos 集成

项目运行于 `${STEEDOS_STORAGE_DIR}/builder6` 目录下。
