
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable('users', function (table) {
        table.increments('id').primary();
        table.string('name').unique(); // Add unique constraint to 'name'
        table.string('email').unique(); // Add unique constraint to 'email'
        table.string('password');
        // Add other columns as needed
      })
      .createTable('products', function (table) {
        table.increments('id').primary();
        table.string('name');
        table.decimal('price', 10, 2);
        table.string('cate');
        table.text('desc');
        table.integer('quant');
        table.integer('user_id').unsigned();
        table.foreign('user_id').references('users.id');
        // Add other columns as needed
      });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('products')
      .dropTableIfExists('users');
  };