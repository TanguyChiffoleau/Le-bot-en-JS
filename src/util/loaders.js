const { readdir } = require('fs').promises
const { Client, Collection } = require('discord.js')
const { removeFileExtension } = require('./util')

module.exports = {
	client: {
		// Création du client et de ses propriétés
		prepare: () => {
			const client = new Client({
				partials: ['GUILD_MEMBER', 'MESSAGE', 'REACTION'],
				ws: {
					intents: [
						'GUILDS',
						'GUILD_MEMBERS',
						'GUILD_PRESENCES',
						'GUILD_MESSAGES',
						'GUILD_MESSAGE_REACTIONS',
						'DIRECT_MESSAGES',
						'GUILD_VOICE_STATES',
					],
				},
			})
			client.commands = new Collection()
			client.cooldowns = new Collection()
			client.config = {
				prefix: process.env.PREFIX,
				guildID: process.env.GUILD_ID,
				reportChannelID: process.env.REPORT_CHANNEL,
				leaveJoinChannelID: process.env.LEAVE_JOIN_CHANNEL_ID,
				logsChannelID: process.env.LOGS_CHANNEL,
				voiceManagerChannelsIDs: process.env.VOICE_CREATOR_CHANNELS_IDS.split(/, +/),
			}
			client.cache = {
				// Messages supprimés par la bot pour ne pas
				// les log lors de l'event "messageDelete"
				deleteMessagesID: new Set(),
			}
			// Map utilisé pour la commande "roles"
			client.commandsCategories = new Map()

			return client
		},

		// Connecte le client en utilisant la
		// variable d'environnement DISCORD_TOKEN
		login: client => client.login(),
	},

	// Chargement des commandes
	commands: async client => {
		// Dossier des commandes
		const commandsDir = await readdir('./src/commands')

		// Pour chaque catégorie de commandes
		commandsDir.forEach(async commandCategory => {
			// Acquisition des commandes
			const commands = (await readdir(`./src/commands/${commandCategory}`)).filter(file =>
				file.endsWith('.js'),
			)

			// Ajout dans la map utilisée pour la commande "roles"
			client.commandsCategories.set(commandCategory, commands.map(removeFileExtension))

			// Pour chaque commande, on l'acquérit et on
			// l'ajoute dans la map des commandes
			commands.forEach(commandFile => {
				const command = require(`../commands/${commandCategory}/${commandFile}`)
				client.commands.set(command.name, command)
			})
		})
	},

	// Chargement des events
	events: async client => {
		// Dossier des events
		const eventsDir = await readdir('./src/events')

		// Pour chaque catégorie d'events
		eventsDir.forEach(async eventCategory => {
			// Acquisition des events
			const events = (await readdir(`./src/events/${eventCategory}`)).filter(file =>
				file.endsWith('.js'),
			)

			// Pour chaque event, on l'acquérit et on le charge
			events.forEach(eventFile => {
				const event = require(`../events/${eventCategory}/${eventFile}`)
				const eventName = removeFileExtension(eventFile)
				client.on(eventName, event.bind(null, client))
			})
		})
	},
}
