const user_channel = []
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
		oldState.channel.id !== newState.channelID &&
		user_channel.includes(oldState.channelID) &&
		client.channels.cache.get(oldState.channelID).members.size === 0
	) {
		client.channels.cache.get(oldState.channelID).delete()
		user_channel.splice(user_channel.indexOf(oldState.channelID), 1)
	}
}
