module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './Trugrady.db', // Adjust the path as needed
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};
