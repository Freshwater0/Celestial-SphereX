exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_hash', 256).alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_hash', 128).alter();
  });
};
