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

## 发版本

```bash
npm login
npm release --access public
```