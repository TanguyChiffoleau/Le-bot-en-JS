const fs = require('fs').promises
const { Client, Collection } = require('discord.js')

module.exports = {
	client: {
		prepare: () => {
			const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
			client.commands = new Collection()
			client.cooldowns = new Collection()
			client.config = {
				prefix: process.env.PREFIX,
				guildID: process.env.GUILD_ID,
				reportChannelID: process.env.REPORT_CHANNEL,
				leaveJoinChannelID: process.env.LEAVE_JOIN_CHANNEL_ID,
				logsChannelID: process.env.LOGS_CHANNEL,
			}

			return client
		},

		login: client => client.login(process.env.DISCORD_TOKEN),
	},

	commands: async client => {
		const commandsDir = await fs.readdir('./src/commands')
		commandsDir.forEach(async commandCategory => {
			const commands = (await fs.readdir(`./src/commands/${commandCategory}`)).filter(file =>
				file.endsWith('.js'),
			)
			commands.forEach(commandFile => {
				const command = require(`../commands/${commandCategory}/${commandFile}`)
				if (command.isEnabled) client.commands.set(command.name, command)
			})
		})
	},

	events: async client => {
		const eventsDir = await fs.readdir('./src/events')
		eventsDir.forEach(async eventCategory => {
			const events = (await fs.readdir(`./src/events/${eventCategory}`)).filter(file =>
				file.endsWith('.js'),
			)
			events.forEach(eventFile => {
				const event = require(`../events/${eventCategory}/${eventFile}`)
				const eventName = eventFile.split('.')[0]
				client.on(eventName, event.bind(null, client))
			})
		})
	},
}
