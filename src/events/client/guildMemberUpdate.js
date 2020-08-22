module.exports = (client, oldGuildMember, newMGuildMember) => {
	if (
		oldGuildMember.user.bot ||
		newMGuildMember.user.bot ||
		oldGuildMember.guild.id !== client.config.guildID ||
		newMGuildMember.guild.id !== client.config.guildID
	)
		return

	if (
		newMGuildMember.displayName.match(
			/^[^a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ].*/,
		)
	)
		newMGuildMember.edit({ nick: 'Change ton pseudo' })
}
