// Import crypto-random-string
const cryptoRandomString = require('crypto-random-string');

// Generate a random string
const secretKey = cryptoRandomString({ length: 32 });

// Log the generated secret key
console.log(secretKey);

