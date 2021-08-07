import { Client, Collection, Intents } from 'discord.js'

// Création du client et de ses propriétés
export default () => {
	const client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Intents.FLAGS.GUILD_VOICE_STATES,
			Intents.FLAGS.DIRECT_MESSAGES,
		],
	})
	client.commands = new Collection()
	client.cooldowns = new Collection()
	client.config = {
		prefix: process.env.COMMANDS_PREFIX,
		guildID: process.env.GUILD_ID,
		reportChannelID: process.env.REPORT_CHANNEL,
		leaveJoinChannelID: process.env.LEAVE_JOIN_CHANNEL_ID,
		logsChannelID: process.env.LOGS_CHANNEL,
		voiceManagerChannelsIDs: process.env.VOICE_MANAGER_CHANNELS_IDS
			? process.env.VOICE_MANAGER_CHANNELS_IDS.split(/, */)
			: [],
		configChannelID: process.env.CONFIG_CHANNEL_ID,
		upgradeChannelID: process.env.UPGRADE_CHANNEL_ID,
	}
	client.cache = {
		// Messages supprimés par la bot pour ne pas
		// les log lors de l'event "messageDelete"
		deleteMessagesID: new Set(),
	}
	// Map utilisé pour la commande "roles"
	client.commandsCategories = new Map()
	// Map utilisé pour la gestion des channels vocaux
	client.voiceManager = new Map()

	return client
}
