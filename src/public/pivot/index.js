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

  const pivotGridChart = $('#pivotgrid-chart').dxChart({
    commonSeriesSettings: {
      type: 'bar',
    },
    tooltip: {
      enabled: true,
      format: 'currency',
      customizeTooltip(args) {
        return {
          html: `${args.seriesName} | Total<div class='currency'>${args.valueText}</div>`,
        };
      },
    },
    size: {
      height: 200,
    },
    adaptiveLayout: {
      width: 450,
    },
  }).dxChart('instance');

  const pivotGrid = $('#pivotgrid').dxPivotGrid({
    allowSortingBySummary: true,
    allowFiltering: true,
    showBorders: true,
    showColumnGrandTotals: false,
    showRowGrandTotals: false,
    showRowTotals: false,
    showColumnTotals: false,
    fieldChooser: {
      enabled: true,
      height: 400,
    },
    dataSource: customDataSource,
  }).dxPivotGrid('instance');

  pivotGrid.bindChart(pivotGridChart, {
    dataFieldsDisplayMode: 'splitPanes',
    alternateDataFields: false,
  });
});

