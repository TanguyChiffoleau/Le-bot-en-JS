module.exports = {
	name: 'nomic',
	description:
		"Crée un channel textuel nomic si vous êtes connecté dans un salon vocal personnalisé. N`'est visible que par les membres connecté au salon vocal personnalisé",
	aliases: ['nm'],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: async (client, message) => {
		if (
			// Vérifie sur l'utilisateur est dans un channel vocal personnalisé
			// et si le channel vocal a déjà un no mic
			client.voiceManager.user_channel.includes(message.member.voice.channelID) &&
			!(message.member.voice.channelID in client.voiceManager.no_mic)
		) {
			// Crée le channel no mic
			const no_mic_chan = await message.guild.channels.create(
				client.channels.cache
					.get(message.member.voice.channelID)
					.name.replace("'s channel", ' no mic'),
				{
					parent: client.channels.cache.get(
						client.channels.cache.get(message.member.voice.channelID).parentID,
					),
				},
			)

			// Set up les permissions pour tout les roles modérateurs
			client.voiceManager.no_mic[message.member.voice.channelID] = no_mic_chan
			client.config.moderatorsRoleIDs.forEach(id => {
				no_mic_chan.updateOverwrite(id, {
					CREATE_INSTANT_INVITE: false,
					MANAGE_CHANNELS: true,
					MANAGE_ROLES: true,
					MANAGE_WEBHOOKS: true,
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
					SEND_TTS_MESSAGES: false,
					MANAGE_MESSAGES: true,
					EMBED_LINKS: true,
					ATTACH_FILES: true,
					READ_MESSAGE_HISTORY: true,
					MENTION_EVERYONE: true,
					USE_EXTERNAL_EMOJIS: true,
					ADD_REACTIONS: true,
				})
			})

			// Set up les permissions pour les membres présents dans le channel
			// Vérifie au préalable si l'utilisateur n'a pas un role modérateur
			// pour éviter tout conflit de permissions
			client.channels.cache.get(message.member.voice.channelID).members.forEach(member => {
				let set_perm = true
				// eslint-disable-next-line no-underscore-dangle
				member._roles.forEach(role => {
					if (client.config.moderatorsRoleIDs.includes(role)) set_perm = false
				})

				if (set_perm)
					no_mic_chan.updateOverwrite(member.user.id, {
						CREATE_INSTANT_INVITE: false,
						MANAGE_CHANNELS: false,
						MANAGE_ROLES: false,
						MANAGE_WEBHOOKS: false,
						VIEW_CHANNEL: true,
						SEND_MESSAGES: true,
						SEND_TTS_MESSAGES: false,
						MANAGE_MESSAGES: false,
						EMBED_LINKS: true,
						ATTACH_FILES: true,
						READ_MESSAGE_HISTORY: true,
						MENTION_EVERYONE: false,
						USE_EXTERNAL_EMOJIS: true,
						ADD_REACTIONS: true,
					})
			})

			// Set up les permissions (pas d'accès) pour le role everyone
			no_mic_chan.updateOverwrite(client.config.guildID, {
				CREATE_INSTANT_INVITE: false,
				MANAGE_CHANNELS: false,
				MANAGE_ROLES: false,
				MANAGE_WEBHOOKS: false,
				VIEW_CHANNEL: false,
				SEND_MESSAGES: false,
				SEND_TTS_MESSAGES: false,
				MANAGE_MESSAGES: false,
				EMBED_LINKS: false,
				ATTACH_FILES: false,
				READ_MESSAGE_HISTORY: false,
				MENTION_EVERYONE: false,
				USE_EXTERNAL_EMOJIS: false,
				ADD_REACTIONS: false,
			})
		}
	},
}
