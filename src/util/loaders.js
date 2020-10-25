const { readdir } = require('fs').promises
const { Client, Collection } = require('discord.js')
const reactionRoleConfig = require('../../config/reactionRoleConfig.json')

module.exports = {
	client: {
		prepare: () => {
			const client = new Client({ partials: ['MESSAGE', 'REACTION'] })
			client.commands = new Collection()
			client.cooldowns = new Collection()
			client.config = {
				prefix: process.env.PREFIX,
				guildID: process.env.GUILD_ID,
				reportChannelID: process.env.REPORT_CHANNEL,
				leaveJoinChannelID: process.env.LEAVE_JOIN_CHANNEL_ID,
				logsChannelID: process.env.LOGS_CHANNEL,
			}
			client.cache = {}
			client.cache.deleteMessagesID = new Set()

			return client
		},

		login: client => client.login(process.env.DISCORD_TOKEN),
	},

	commands: async client => {
		const commandsDir = await readdir('./src/commands')
		commandsDir.forEach(async commandCategory => {
			const commands = (await readdir(`./src/commands/${commandCategory}`)).filter(file =>
				file.endsWith('.js'),
			)
			commands.forEach(commandFile => {
				const command = require(`../commands/${commandCategory}/${commandFile}`)
				if (command.isEnabled) client.commands.set(command.name, command)
			})
		})
	},

	events: async client => {
		const eventsDir = await readdir('./src/events')
		eventsDir.forEach(async eventCategory => {
			const events = (await readdir(`./src/events/${eventCategory}`)).filter(file =>
				file.endsWith('.js'),
			)
			events.forEach(eventFile => {
				const event = require(`../events/${eventCategory}/${eventFile}`)
				const eventName = eventFile.split('.')[0]
				client.on(eventName, event.bind(null, client))
			})
		})
	},

	reactionManager: async client => {
		client.reactionRoleMap = new Map()
		for (const reactionRole of reactionRoleConfig) {
			client.reactionRoleMap.set(reactionRole.messageId, reactionRole)
			const channel = await client.channels.fetch(reactionRole.channelId)
			const message = await channel.messages.fetch(reactionRole.messageId)

			for (const emoji of Object.keys(reactionRole.emojiRoleMap)) await message.react(emoji)
		}
	},
}
