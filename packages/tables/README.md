# Builder6 Tables Module


## Steedos Dependencies

```yml
objects:
  - b6_tables
  - b6_fields
``` 

## Config Variables

```json
  "tables": {
    "mongo": {
      "url": "mongodb://127.0.0.1:27017/tables"
    }
  },
```

## DevExtreme DataGrid

http://localhost:5100/b6/tables/grid/test/test

## Ag-Grid

http://localhost:5100/b6/tables/ag-grid/test/test

## 数据校验

先校验字段值有效性，校验合法的各种字段类型值，再校验用户配置的校验规则，最终把所有校验错误信息合并提示给用户。

### 字段类型校验

各种字段类型校验规则：

- number: 合法number，小数位数
- date: 合法的日期格式，YYYY-MM-DD、YYYY/MM/DD，兼容前导0省略情况，另外兼容了 YYYY-MM-DDTHH:MM:SS.SSSZ 这种服务端返回的格式（复制其它字段列保存时，是保存整行数据，日期列会自动取这种格式提交）
- select: 数据类型只支持字符串，且必须是字段定义过的选项范围内值
- boolean: true/false TRUE/FALSE

其它逻辑：每种字段类型校验失败都不会去主动变更转换字段值，以原始值交给ag-grid显示以明显告知用户数据不合法。

