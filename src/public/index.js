async function initializeGrid(baseId = 'test', tableId='test') {
  const tableResponse = await fetch(`/api/tables/v0/meta/bases/${baseId}/tables/${tableId}`);
  const table = await tableResponse.json();
  
  console.log(table)

  function isNotEmpty(value) {
    return value !== undefined && value !== null && value !== "";
  }

  var customDataSource = new DevExpress.data.CustomStore({
    key: "_id",
    load: function(loadOptions) {
        var d = $.Deferred();
        var params = {};

        [
            "filter",
            "group", 
            "groupSummary",
            "parentIds",
            "requireGroupCount",
            "requireTotalCount",
            "searchExpr",
            "searchOperation",
            "searchValue",
            "select",
            "sort",
            "skip",     
            "take",
            "totalSummary", 
            "userData"
        ].forEach(function(i) {
            if(i in loadOptions && isNotEmpty(loadOptions[i])) {
                params[i] = JSON.stringify(loadOptions[i]);
            }
        });

        $.getJSON(`/api/tables/v0/${baseId}/${tableId}`, params)
            .done(function(response) {
                d.resolve(response.data, { 
                    totalCount: response.totalCount,
                    summary: response.summary,
                    groupCount: response.groupCount
                });
            })
            .fail(function() { throw "Data loading error" });
        return d.promise();
    },

    insert: function(values) {
      var deferred = $.Deferred();
      $.ajax({
          url: `/api/tables/v0/${baseId}/${tableId}`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(values)
      })
      .done(deferred.resolve)
      .fail(function(e){
          deferred.reject("Insertion failed");
      });
      return deferred.promise();
    },
    remove: function(key) {
        var deferred = $.Deferred();
        $.ajax({
            url: `/api/tables/v0/${baseId}/${tableId}/` + encodeURIComponent(key),
            method: "DELETE"
        })
        .done(deferred.resolve)
        .fail(function(e){
            deferred.reject("Deletion failed");
        });
        return deferred.promise();
    },
    update: function(key, values) {
        var deferred = $.Deferred();
        $.ajax({
            url: `/api/tables/v0/${baseId}/${tableId}/` + encodeURIComponent(key),
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(values)
        })
        .done(deferred.resolve)
        .fail(function(e){
            deferred.reject("Update failed");
        });
        return deferred.promise();
    }
    // Needed to process selected value(s) in the SelectBox, Lookup, Autocomplete, and DropDownBox
    // byKey: function(key) {
    //     var d = new $.Deferred();
    //     $.get('https://mydomain.com/MyDataService?id=' + key)
    //         .done(function(result) {
    //             d.resolve(result);
    //         });
    //     return d.promise();
    // }
  });


  const columns = table.fields.map(field => {
    let dataType;

    // 根据字段类型设置 dataType
    switch (field.type) {
        case 'text':
            dataType = 'string';
            break;
        case 'number':
            dataType = 'number';
            break;
        case 'date':
            dataType = 'date';
            break;        
        case 'datetime':
            dataType = 'datetime';
            break;
        case 'boolean':
            dataType = 'boolean';
            break;
        default:
            dataType = 'string'; // 默认类型
    }

    return {
        dataField: field.name.toLowerCase(), // 假设字段名需要小写
        caption: field.name,
        dataType: dataType,
    };
  });

  $('#gridContainer').dxDataGrid({
    dataSource: customDataSource,
    paging: {
      pageSize: 10,
    },
    pager: {
      visible: true,
      showPageSizeSelector: true,
      allowedPageSizes: [10, 25, 50, 100],
    },
    remoteOperations: true,
    searchPanel: {
      visible: true,
      highlightCaseSensitive: true,
    },
    groupPanel: { visible: true },
    grouping: {
      autoExpandAll: false,
    },
    editing: {
      mode: 'popup',
      allowUpdating: true,
      allowAdding: true,
      allowDeleting: true,
      popup: {
        title: 'Employee Info',
        showTitle: true,
        width: 700,
        height: 525,
      },
    },
    filterPanel: { visible: true },
    headerFilter: { visible: true },
    selection: {
      mode: 'multiple',
    },
    allowColumnReordering: true,
    allowColumnResizing: true,
    columnAutoWidth: true,
    columnChooser: {
      enabled: true,
    },
    columnFixing: {
      enabled: true,
    },
    rowAlternationEnabled: true,
    showBorders: true,
    width: '100%',
    columns: columns,
    export: {
      enabled: true,
      allowExportSelectedData: true,
    },
    onExporting(e) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(table.name);

      DevExpress.excelExporter.exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }),`${table.name}.xlsx`);
        });
      });
    },
    onContentReady(e) {
    },
  });
}

$(() => {initializeGrid()})

