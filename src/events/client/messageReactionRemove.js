module.exports = async (client, messageReaction, user) => {
	if (messageReaction.partial) await messageReaction.fetch()
	const { message, emoji } = messageReaction

	if (
		user.bot ||
		!message.guild ||
		!message.guild.available ||
		message.guild.id !== client.config.guildID
	)
		return

	if (client.reactionRoleMap.has(message.id)) {
		const rule = client.reactionRoleMap.get(message.id)
		const roleID = rule.emojiRoleMap[emoji.id || emoji.name]
		if (!roleID) return

		const guildMember = await message.guild.members.fetch(user)

		if (guildMember.roles.cache.has(roleID)) return guildMember.roles.remove(roleID)
	}
}
