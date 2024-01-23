// importing libraies that we installed using npm
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const knex = require('knex');
const knexConfig = require('./knexfile');
const path = require('path');
const cryptoRandomString = require('crypto-random-string');


require('dotenv').config();
const secretKey = process.env.SESSION_SECRET || 'default-secret-key';


const app = express();
const PORT = 3000;

// database configuration
const db = knex(knexConfig);

db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the application if the database connection fails
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

app.get('/style.css', function(req, res) {
  res.header("Content-Type", "text/css");
  res.sendFile(__dirname + '/public/style.css');
});


// Create the 'users' table if it doesn't exist
const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`;

// Create the 'products' table if it doesn't exist
const createProductsTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price DECIMAL(10, 2),
    cate TEXT,
    desc TEXT,
    quant INTEGER,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`;

// Run the migrations
db.raw(createUserTableQuery)
  .then(() => {
    console.log('Users table checked/created');
    return db.raw(createProductsTableQuery);
  })
  .then(() => {
    console.log('Products table checked/created');
  })
  .catch((err) => {
    console.error('Error creating tables:', err);
  });


  app.get('/logout', (req, res) => {
    // Perform any necessary cleanup (e.g., destroying the session)
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
      }
      // Redirect to the home page after logout
      res.redirect('/index.html');
    });
  });


// Registration route
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html');
});

app.post('/register-user', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const [userId] = await db('users').insert({
      name,
      email,
      password: hashedPassword
    });

 // Log the user object for inspection
 console.log('User Object:', JSON.stringify({ userId, name, email }, null, 2));   

 // Send a success response with a message and redirect URL
 res.json({
  success: true,
  message: 'Successfully registered. Redirecting to login page...',
  redirectURL: './login.html'
});
} catch (error) {
console.error('Error during registration:', error);
res.status(500).json({ error: 'Internal Server Error' });
}
});


// Login route
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login-user', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve the user from the database by email
    const user = await db('users').where('email', email).first();

    if (user) {
      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
         // Store the user ID in the session
         req.session.userId = user.id;


        // Include the login URL in the response
        res.json({ success: true, redirectURL: '/dashboard' });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API endpoint to get products
app.get('/api/products',  (req, res) => {
   const userId = req.session.userId;

  db('products').select('*').where('user_id', userId)
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

   // Assuming you have user authentication middleware that sets req.user
   const userId = req.session.userId;

   // Add user_id to the new product
   newProduct.user_id = userId;

   db('products').insert(newProduct)
    .then(() => res.json(newProduct))
    .catch((err) => {
      console.error('Error adding product:', err);
      res.status(500).send('Internal Server Error');
    });
});

// API endpoint to update a product
app.put('/api/products/:id',  async (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;
  const updateData = {
          name: updatedProduct.name,
          price: updatedProduct.price,
          cate: updatedProduct.cate,
          desc: updatedProduct.desc,
          quant: updatedProduct.quant
        };
 db('products')
  .where('d',1)
  .update(updateData)
  .then((updatedRows) => {
    console.log(`Updated ${updatedRows} rows successfully`);
  })
  .catch((error) => {
    console.error('Error updating record:', error);
  });
  
  
  // db('products').select('*').where('name', updatedProduct.name).where('cate', updatedProduct.cate).whereNot('id', productId)
  //   .then((results) => {
  //     if (results.length > 0) {
  //       // Product with the same name and category already exists
  //       res.status(400).json({ error: 'Product with the same name and category already exists' });
  //     } else {
  //       console.log('ss')
  //       // No conflict, proceed with the update
  //        db('products').where('id', 1).update({
  //         name: updatedProduct.name,
  //         price: updatedProduct.price,
  //         cate: updatedProduct.cate,
  //         desc: updatedProduct.desc,
  //         quant: updatedProduct.quant
  //       })
  //       .then(() => res.json(productId))
  //       .catch((err) => {
  //         console.error('Error updating product:', err);
  //         res.status(500).send('Internal Server Error');
  //       });
  //     }
  //   })
  //   .catch((err) => {
  //     console.error('Error checking for existing product:', err);
  //     res.status(500).send('Internal Server Error');
  //   });
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
