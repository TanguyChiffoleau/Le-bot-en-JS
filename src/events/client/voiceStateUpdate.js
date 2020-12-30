module.exports = async (client, oldState, newState) => {
	if (
		// Vérifie si l'utilisateur rentre dans un channel vocal
		// qui permet la création d'autre channel vocaux
		oldState.channelID !== newState.channelID &&
		client.config.voiceManagerChannelsIDs.includes(newState.channelID)
	) {
		// Création du channel vocal
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(newState.id)
		const channel = await client.channels.cache
			.get(newState.channelID)
			.clone({ name: `${member.user.username}'s channel` })

		// Déplacement du membre dans son nouveau channel vocal
		await member.voice.setChannel(channel)
		// Ajout de l'id du channel vocal perso dans une liste
		client.voiceManager.user_channel.push(channel.id)
	}

	if (
		// Vérifie si un utilisateur quitte le channel et qu'il est vide
		oldState.channelID !== newState.channelID &&
		client.voiceManager.user_channel.includes(oldState.channelID) &&
		client.channels.cache.get(oldState.channelID).members.size === 0
	) {
		// Suppresion du channel et son eventuel no mic
		client.channels.cache.get(oldState.channelID).delete()
		client.voiceManager.user_channel.splice(
			client.voiceManager.user_channel.indexOf(oldState.channelID),
			1,
		)
		if (oldState.channelID in client.voiceManager.no_mic)
			await client.voiceManager.no_mic[oldState.channelID].delete()
	}

	if (
		// Vérifie si un membres quitte un channel vocal perso
		// et si celui-ci possède un no mic
		oldState.channelID !== newState.channelID &&
		client.voiceManager.user_channel.includes(oldState.channelID) &&
		oldState.channelID in client.voiceManager.no_mic &&
		client.voiceManager.no_mic[oldState.channelID].permissionOverwrites.has(oldState.id)
	)
		// Supprime les permissions du membre pour le no mic
		await client.voiceManager.no_mic[oldState.channelID].permissionOverwrites
			.get(newState.id)
			.delete()

	if (
		// Vérifie si un membre rejoint un vocal perso
		// et si celui-ci possède un no mic
		oldState.channelID !== newState.channelID &&
		client.voiceManager.user_channel.includes(newState.channelID) &&
		newState.channelID in client.voiceManager.no_mic
	) {
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(newState.id)

		// Ajout des permissions pour le no mic au nouveau membre
		// vérifie au préalable si il n'est pas modérateurs
		// pour éviter les clonfits de permissions
		let set_perm = true
		// eslint-disable-next-line no-underscore-dangle
		member._roles.forEach(role => {
			if (client.config.moderatorsRoleIDs.includes(role)) set_perm = false
		})

		if (set_perm)
			await client.voiceManager.no_mic[newState.channelID].updateOverwrite(newState.id, {
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
	}
}
