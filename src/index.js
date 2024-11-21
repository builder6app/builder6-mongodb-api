require('babel-polyfill');
const express = require('express');
const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');
const query = require('devextreme-query-mongodb');
const getOptions = require('devextreme-query-mongodb/options').getOptions;

const mongoUri = 'mongodb://localhost:27017/steedos';

const app = express();
app.use(require('cors')());
// app.use(require('morgan')('dev'));

function handleError(res, reason, message, code) {
  console.error('ERROR: ' + reason);
  res.status(code || 500).json({ error: message });
}

function getQueryOptions(req) {
  return getOptions(req.query, {
    areaKM2: 'int',
    population: 'int'
  });
}

async function getData(coll, req, res) {
  try {
    const options = getQueryOptions(req);
    if (options.errors.length > 0)
      console.error('Errors in query string: ', JSON.stringify(options.errors));

    const results = await query(
      coll,
      options.loadOptions,
      options.processingOptions
    );
    res.status(200).jsonp(results);
  } catch (err) {
    handleError(res, err, 'Failed to retrieve data');
  }
}

// 连接 mongo 数据库




mongodb.MongoClient.connect(mongoUri, function(err, database) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  app.get('/countries', function(req, res) {
    getData(database.collection('countries'), req, res);
  });

  console.log('Database connection ready');


});



const httpServer = http.createServer(app);
httpServer.listen(process.env.HTTPPORT || 3000, function() {
  const port = httpServer.address().port;
  console.log('HTTP server running on port', port);
});