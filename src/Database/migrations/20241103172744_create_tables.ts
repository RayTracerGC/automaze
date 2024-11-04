import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.string('id', 19).primary();
        table.string('username', 32).notNullable();
        table.string('display_name');
        table.integer('bananas').defaultTo(0);
        table.timestamps(true, true);
    });

    await knex.schema.createTable('resources', (table) => {
        table.increments('id').primary();
        table.string('category').notNullable();
        table.string('url').notNullable();
        table.string('displayTitle');
        table.string('emoji');
        table.string('authors');
    });

    await knex.schema.createTable('collaborators', (table) => {
        table.string('id').primary();
        table.string('username').notNullable();
        table.string('displayName');
    });

    await knex.schema.createTable('settings', (table) => {
        table.increments('id').primary();
        table.string('debug_guild_id');
        table.string('debug_guild_channel_id');
        table.boolean('send_logs');
        table.boolean('send_automated_replies');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('resources');
    await knex.schema.dropTableIfExists('collaborators');
    await knex.schema.dropTableIfExists('settings');
}