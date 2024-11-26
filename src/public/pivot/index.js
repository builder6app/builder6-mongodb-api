async function initializeGrid(baseId = 'test', tableId='test') {
  const tableResponse = await fetch(`/api/tables/v0/meta/bases/${baseId}/tables/${tableId}`);
  const table = await tableResponse.json();
  
  console.log(table)
  
  function isNotEmpty(value) {
    return value !== undefined && value !== null && value !== "";
  }

  var customDataSource = {
    key: "_id",
    remoteOperations: true,
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
  };

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
      allowSearch: true,
      height: 600,
    },
    headerFilter: {
      search: {
        enabled: true,
      },
      showRelevantValues: true,
      width: 300,
      height: 400,
    },
    fieldPanel: {
      visible: true,
    },
    dataSource: customDataSource,
  }).dxPivotGrid('instance');

  pivotGrid.bindChart(pivotGridChart, {
    dataFieldsDisplayMode: 'splitPanes',
    alternateDataFields: false,
  });
}


$(() => {initializeGrid()})

