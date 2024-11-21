$(() => {

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

        $.getJSON("/records/space_users", params)
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
    remoteOperations: false,
    searchPanel: {
      visible: true,
      highlightCaseSensitive: true,
    },
    groupPanel: { visible: true },
    grouping: {
      autoExpandAll: false,
    },
    allowColumnReordering: true,
    rowAlternationEnabled: true,
    showBorders: true,
    width: '100%',
    columns: [
      {
        dataField: 'name',
      },
      {
        dataField: 'profile',
        caption: 'Profile',
        dataType: 'string',
      },
      {
        dataField: 'created',
        dataType: 'date',
      },
      {
        dataField: 'created_by',
        dataType: 'string',
      },
    ],
    onContentReady(e) {
    },
  });
});

let collapsed = false;
