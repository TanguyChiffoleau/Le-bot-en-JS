const { modifyWrongUsernames } = require('../../util/util')

module.exports = (client, oldGuildMember, newMGuildMember) => {
	const guild = oldGuildMember.guild || newMGuildMember.guild
	const isBot = oldGuildMember.user.bot || newMGuildMember.user.bot
	if (isBot || guild.id !== client.config.guildID) return

	modifyWrongUsernames(newMGuildMember)
}
