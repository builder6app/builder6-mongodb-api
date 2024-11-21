require('babel-polyfill');

const path = require('path');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const devextremeQuery = require('devextreme-query-mongodb');
const getOptions = require('devextreme-query-mongodb/options').getOptions;

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')))

// MongoDB connection
const url = 'mongodb://localhost:27017';
const dbName = 'steedos';
let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => console.error('Error connecting to MongoDB', err));

// CRUD Routes

// Create
app.post('/records/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const result = await db.collection(collectionName).insertOne(req.body);
    res.status(201).send(result.ops[0]);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all
app.get('/records/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    // const items = await db.collection(collectionName).find({}).toArray();
    const options = getOptions(req.query, {
      areaKM2: 'int',
      population: 'int',
    });
    if (options.errors.length > 0)
      console.error('Errors in query string: ', JSON.stringify(options.errors));

    console.log("query start", options)

    options.processingOptions.replaceIds = false;
    const results = await devextremeQuery(
      db.collection(collectionName),
      options.loadOptions,
      options.processingOptions
    );
    
    console.log("query end", options, results)
    res.status(200).send(results);
  } catch (error) {
    console.log("query error", error)
    res.status(500).send(error);
  }
});


// Read all
app.get('/records/:collectionName/all', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const items = await db.collection(collectionName).find({}).toArray();
    
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read one
app.get('/records/:collectionName/:id', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const item = await db.collection(collectionName).findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.status(404).send();
    }
    res.status(200).send(item);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update
app.patch('/records/:collectionName/:id', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return res.status(404).send();
    }
    res.status(200).send(result.value);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete
app.delete('/records/:collectionName/:id', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) {
      return res.status(404).send();
    }
    res.status(200).send({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});