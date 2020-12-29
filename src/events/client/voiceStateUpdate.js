const user_channel = []
module.exports = async (client, before, after) => {
	if (
		after.channelID &&
		before.channelID !== after.channelID &&
		client.config.voiceCreateCreatorsIDs.includes(after.channelID)
	) {
		const member = client.guilds.cache.get(client.config.guildID).members.cache.get(after.id)
		const channel = await client.channels.cache
			.get(after.channelID)
			.clone({ name: `${member.user.username}'s channel` })
		member.voice.setChannel(channel)
		user_channel.push(channel.id)
	}
	if (
		before.channelID &&
		before.channel.id !== after.channelID &&
		user_channel.includes(before.channelID) &&
		client.channels.cache.get(before.channelID).members.size === 0
	) {
		client.channels.cache.get(before.channelID).delete()
		user_channel.splice(user_channel.indexOf(before.channelID), 1)
	}
}
