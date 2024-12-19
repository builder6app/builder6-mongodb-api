# Builder6 Pages Module


## Steedos Dependencies

```yml
objects:
  - b6_pages
  - b6_projects
``` 

## Config Variables

```yml
root:
  url: http://localhost:5100
amis:
  url: https://unpkg.steedos.cn/amis@3.2.0
  version: 3.2.0
unpkg:
  url: https://unpkg.steedos.cn
widgets:
  version: 6.3.11-beta.19
  additional: @steedos-widgets/liveblocks
pages:
```

## 配置定时发送

```
STEEDOS_CRON_MAILQUEUE_INTERVAL=3000 # 邮件定时器，单位：毫秒
```