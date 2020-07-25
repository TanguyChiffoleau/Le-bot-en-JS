module.exports = (client, oldGuildMember, newMGuildMember) => {
	if (
		oldGuildMember.guild.id !== process.env.GUILD_ID ||
		oldGuildMember.user.bot ||
		newMGuildMember.guild.id !== process.env.GUILD_ID ||
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
