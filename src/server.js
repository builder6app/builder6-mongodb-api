require('dotenv-flow').config({});
require('babel-polyfill');

const uuid = require('uuid');
const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const devextremeQuery = require('devextreme-query-mongodb');
const getOptions = require('devextreme-query-mongodb/options').getOptions;

const app = express();
const port = 3000;

// Middleware

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded()

app.use(jsonParser);
app.use(express.static(path.join(__dirname,'public')))

// MongoDB connection
const url = process.env.B6_TABLES_MONGO_URI;
let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db();
  })
  .catch(err => console.error('Error connecting to MongoDB', err));

// Create
app.post('/api/tables/v0/:baseId/:tableId', async (req, res) => {
   
  try {
    const _id = uuid.v4();
    const data = {
      _id,
      ...req.body
    }
    const collectionName = `t_${req.params.baseId}_${req.params.tableId}`;
    const result = await db.collection(collectionName).insertOne(data);
    console.log('insert', data, result);

    res.status(201).send(result.insertedId);
  } catch (error) {
    console.error("query error", error)
    res.status(500).send(error);
  }
});

// Query Table
app.get('/api/tables/v0/:baseId/:tableId', async (req, res) => {
  try {
    const collectionName = `t_${req.params.baseId}_${req.params.tableId}`;
    const options = getOptions(req.query, {
      areaKM2: 'int',
      population: 'int',
    });
    if (options.errors.length > 0)
      console.error('Errors in query string: ', JSON.stringify(options.errors));

    console.log("query start", options)

    const loadOptions = {
      take: 20,
      skip: 0,
      ...options.loadOptions
    }
    const processingOptions = {
      replaceIds: false,
      ...options.processingOptions
    }
    const results = await devextremeQuery(
      db.collection(collectionName),
      loadOptions,
      processingOptions
    );
    
    console.log("query end", options, results)
    res.status(200).send(results);
  } catch (error) {
    console.error("query error", error)
    res.status(500).send(error);
  }
});


// Read one
app.get('/api/tables/v0/:baseId/:tableId/:id', async (req, res) => {
  try {
    const collectionName = `t_${req.params.baseId}_${req.params.tableId}`;
    const item = await db.collection(collectionName).findOne({ _id: req.params.id });
    if (!item) {
      return res.status(404).send();
    }
    res.status(200).send(item);
  } catch (error) {
    console.log("query error", error)
    res.status(500).send(error);
  }
});

// Update
app.put('/api/tables/v0/:baseId/:tableId/:id', async (req, res) => {
  try {
    const collectionName = `t_${req.params.baseId}_${req.params.tableId}`;
    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    console.log('update', req.body, result)
    if (!result) {
      return res.status(404).send();
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("query error", error)
    res.status(500).send(error);
  }
});

// Delete
app.delete('/api/tables/v0/:baseId/:tableId/:id', async (req, res) => {
  try {
    const collectionName = `t_${req.params.baseId}_${req.params.tableId}`;
    const result = await db.collection(collectionName).deleteOne({ _id: req.params.id });
    if (!result.deletedCount) {
      return res.status(404).send();
    }
    res.status(200).send({ message: 'Item deleted' });
  } catch (error) {
    console.error("query error", error)
    res.status(500).send(error);
  }
});

// Table metadata
app.get('/api/tables/v0/meta/bases/:baseId/tables/:tableId', async (req, res) => {
  try {
    const table = {
      "_id": req.params.tableId,
      "base_id": req.params.baseId,
      "name": "Tasks",
      "description": "I was changed!",
      "fields": [
        {
          "_id": "fld001",
          "name": "Name",
          "type": "text"
        },
        {
          "_id": "fld002",
          "name": "Company",
          "type": "text"
        },
        {
          "_id": "fld003",
          "name": "Age",
          "type": "number"
        },
        {
          "_id": "fld004",
          "name": "Created",
          "type": "datetime"
        },
        {
          "_id": "fld005",
          "name": "valid",
          "type": "boolean"
        },
      ],
    }
    res.status(200).send(table);
  } catch (error) {
    console.error("query error", error)
    res.status(500).send(error);
  }
});




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});