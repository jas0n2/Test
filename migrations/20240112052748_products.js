
 /**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('products', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.decimal('price', 10, 2);
      table.string('cate');
      table.text('desc');
      table.integer('quant');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('products');
  };
   