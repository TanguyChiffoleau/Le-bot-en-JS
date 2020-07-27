module.exports = (client, oldGuildMember, newMGuildMember) => {
	if (
		oldGuildMember.guild.id !== client.config.guildID ||
		oldGuildMember.user.bot ||
		newMGuildMember.guild.id !== client.config.guildID ||
		newMGuildMember.user.bot
	)
		return

	if (
		newMGuildMember.displayName.match(
			/^[^a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ].*/,
		)
	)
		newMGuildMember.edit({ nick: 'Change ton pseudo' })
}
