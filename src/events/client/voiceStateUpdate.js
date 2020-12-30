module.exports = async (client, oldState, newState) => {
	if (
		oldState.channelID !== newState.channelID &&
		client.config.voiceManagerChannelsIDs.includes(newState.channelID)
	) {
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(newState.id)
		const channel = await client.channels.cache
			.get(newState.channelID)
			.clone({ name: `${member.user.username}'s channel` })

		await member.voice.setChannel(channel)
		client.voiceManager.user_channel.push(channel.id)
	}

	if (
		oldState.channelID !== newState.channelID &&
		client.voiceManager.user_channel.includes(oldState.channelID) &&
		client.channels.cache.get(oldState.channelID).members.size === 0
	) {
		client.channels.cache.get(oldState.channelID).delete()
		client.voiceManager.user_channel.splice(
			client.voiceManager.user_channel.indexOf(oldState.channelID),
			1,
		)
		if (oldState.channelID in client.voiceManager.no_mic)
			await client.voiceManager.no_mic[oldState.channelID].delete()
	}

	if (
		oldState.channelID !== newState.channelID &&
		client.voiceManager.user_channel.includes(oldState.channelID) &&
		oldState.channelID in client.voiceManager.no_mic &&
		client.voiceManager.no_mic[oldState.channelID].permissionOverwrites.has(oldState.channelID)
	)
		await client.voiceManager.no_mic[oldState.channelID].permissionOverwrites
			.get(newState.id)
			.delete()

	if (
		oldState.channelID !== newState.channelID &&
		client.voiceManager.user_channel.includes(newState.channelID) &&
		newState.channelID in client.voiceManager.no_mic
	) {
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(newState.id)
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
