const { sql } = require('slonik')
const { getPool } = require('../../util/database')

module.exports = {
	name: 'test',
	description: 'Test',
	aliases: [],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: async (client, message) => {
		const pool = getPool()

		const start = new Date()

		const res = await pool.any(
			sql`EXPLAIN ANALYZE SELECT * FROM custom_commands WHERE name = 'test1';`,
		)
		const time = new Date() - start

		return message.reply(`${time} ms | ${res[2]['QUERY PLAN']}, ${res[3]['QUERY PLAN']}`)
	},
}
