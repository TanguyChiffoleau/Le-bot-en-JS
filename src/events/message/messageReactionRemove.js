export default async (messageReaction, user, client) => {
	const { message, emoji } = messageReaction

	if (message.partial) await message.fetch()
	if (messageReaction.partial) await messageReaction.fetch()

	if (
		user.bot ||
		!message.guild ||
		!message.guild.available ||
		message.guild.id !== client.config.guildID
	)
		return

	// Partie système de réaction/role
	if (client.reactionRoleMap.has(message.id)) {
		const emojiRoleMap = client.reactionRoleMap.get(message.id)
		const resolvedEmoji = emoji.id || emoji.name
		const { id: roleID, giveJoinRole = false } = emojiRoleMap[resolvedEmoji]
		const guildMember = await message.guild.members.fetch(user)

		// Système rôle arrivant
		if (giveJoinRole) {
			const joinRole = client.config.joinRoleID
			guildMember.roles.remove(joinRole)
		}

		return guildMember.roles.remove(roleID)
	}
}
