module.exports = async (client, messageReaction, user) => {
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
		const guildMember = await message.guild.members.fetch(user)

		return guildMember.roles.remove(roleID)
	}
}
