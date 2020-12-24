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

		const res = await pool.any(sql`SELECT * FROM "Custom commands"`)

		console.table(res)
		return message.channel.send('check console')
	},
}
