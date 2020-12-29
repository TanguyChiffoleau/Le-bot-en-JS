const user_channel = []
const no_mic = {}
const modo_id_roles = []
module.exports = async (client, oldState, newState) => {
	if (
		newState.channelID &&
		oldState.channelID !== newState.channelID &&
		client.config.voiceCreateCreatorsIDs.includes(newState.channelID)
	) {
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(newState.id)
		const channel = await client.channels.cache
			.get(newState.channelID)
			.clone({ name: `${member.user.username}'s channel` })
		await member.voice.setChannel(channel)
		user_channel.push(channel.id)
	}
	if (
		oldState.channelID &&
		oldState.channelID !== newState.channelID &&
		user_channel.includes(oldState.channelID) &&
		client.channels.cache.get(oldState.channelID).members.size === 0
	) {
		client.channels.cache.get(oldState.channelID).delete()
		user_channel.splice(user_channel.indexOf(oldState.channelID), 1)
		if (no_mic.includes(oldState.channelID)) await no_mic[oldState.channelID].delete()
	}
	if (
		oldState.channelID &&
		oldState.channelID !== newState.channelID &&
		user_channel.includes(oldState.channelID) &&
		oldState.channelID in no_mic
	)
		await no_mic[oldState.channelID].permissionOverwrites.get(newState.id).delete()
	if (
		newState.channelID &&
		oldState.channelID !== newState.channelID &&
		user_channel.includes(newState.channelID) &&
		newState.channelID in no_mic
	) {
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(newState.id)
		let set_perm = true
		for (const role in member.roles) if (modo_id_roles.includes(role.id)) set_perm = false
		if (set_perm)
			await no_mic[newState.channelID].overwritePermissions([
				{
					id: newState.id,
					allow: [
						'VIEW_CHANNEL',
						'SEND_MESSAGES',
						'EMBED_LINKS',
						'ATTACH_FILES',
						'READ_MESSAGE_HISTORY',
						'USE_EXTERNAL_EMOJIS',
						'ADD_REACTIONS',
					],
					deny: [
						'CREATE_INSTANT_INVITE',
						'MANAGE_CHANNELS',
						'MANAGE_WEBHOOKS',
						'SEND_TTS_MESSAGES',
						'MANAGE_MESSAGES',
						'EMBED_LINKS',
						'MENTION_EVERYONE',
					],
				},
			])
	}
}
