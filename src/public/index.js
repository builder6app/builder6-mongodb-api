$(() => {

  const objectName = 'space_users';
  
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

        $.getJSON(`/records/${objectName}`, params)
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
          url: `/records/${objectName}`,
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
            url: `/records/${objectName}/` + encodeURIComponent(key),
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
            url: `/records/${objectName}/` + encodeURIComponent(key),
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
