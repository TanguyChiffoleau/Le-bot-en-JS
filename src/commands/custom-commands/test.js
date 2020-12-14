const { query } = require('../../util/database')

module.exports = {
	name: 'test',
	description: 'Test',
	aliases: [],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: async (client, message) => {
		const { rows: res } = await query('SELECT * FROM "Custom commands"')
		console.table(res)
		return message.channel.send('check console')
	},
}
