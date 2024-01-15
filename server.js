const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const knexConfig = require('./knexfile');

const app = express();
const PORT = 3000;

// Connect to the SQLite database using Knex
const db = knex(knexConfig);

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like your index.html)
app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// style route
app.get('/style.css', function(req, res) {
  res.header("Content-Type", "text/css");
  res.sendFile(__dirname + '/public/style.css');
});

// Create the 'products' table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price DECIMAL(10, 2),
    cate TEXT,
    desc TEXT,
    quant INTEGER
  )
`;

// Run the migration
db.raw(createTableQuery)
  .then(() => {
    console.log('Table checked/created');
    console.log(`Server is ready, check http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error('Error creating table:', err);
  });

// API endpoint to get products
app.get('/api/products', (req, res) => {
  db('products').select('*')
    .then((results) => res.json(results))
    .catch((err) => {
      console.error('Error getting products:', err);
      res.status(500).send('Internal Server Error');
    });
});


// API endpoint to add a product
app.post('/api/products', (req, res) => {
  const newProduct = req.body;

  // Basic validation
  if (!newProduct || !newProduct.name || !newProduct.price || !newProduct.cate || !newProduct.desc || !newProduct.quant) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  db('products').insert(newProduct)
    .then(() => res.json(newProduct))
    .catch((err) => {
      console.error('Error adding product:', err);
      res.status(500).send('Internal Server Error');
    });
});

// API endpoint to update a product
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  // Check for existing product with the same name and category
  db('products').select('*').where('name', updatedProduct.name).where('cate', updatedProduct.cate).whereNot('id', productId)
    .then((results) => {
      if (results.length > 0) {
        // Product with the same name and category already exists
        res.status(400).json({ error: 'Product with the same name and category already exists' });
      } else {
        // No conflict, proceed with the update
        db('products').where('id', productId).update({
          name: updatedProduct.name,
          price: updatedProduct.price,
          cate: updatedProduct.cate,
          desc: updatedProduct.desc,
          quant: updatedProduct.quant
        })
        .then(() => res.json(updatedProduct))
        .catch((err) => {
          console.error('Error updating product:', err);
          res.status(500).send('Internal Server Error');
        });
      }
    })
    .catch((err) => {
      console.error('Error checking for existing product:', err);
      res.status(500).send('Internal Server Error');
    });
});


// API endpoint to delete a product
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  console.log('Deleting product with ID:', productId);

  db('products')
    .where('id', productId)
    .del()
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error('Error deleting product:', err);
      res.status(500).send('Internal Server Error');
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
