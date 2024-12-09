# Builder6 Records API

## 配置环境变量

```
TABLES_MONGO_URL=mongodb://root:steedos@localhost:27017/b6_records?authSource=admin
MONGO_URL=mongodb://root:steedos@localhost:27017/steedos?authSource=admin
```

## 启动服务

```
yarn 
yarn start
```

## 访问 demo

```
http://localhost:5100/demo/grid/:baseId/:tableId/
```