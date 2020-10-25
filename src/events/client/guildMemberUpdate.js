module.exports = (client, oldGuildMember, newMGuildMember) => {
	const guild = oldGuildMember.guild || newMGuildMember.guild
	const isBot = oldGuildMember.user.bot || newMGuildMember.user.bot
	if (isBot || guild.id !== client.config.guildID) return

	if (
		newMGuildMember.displayName.match(
			/^[^a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ].*/,
		)
	)
		newMGuildMember.edit({ nick: 'Change ton pseudo' })
}
