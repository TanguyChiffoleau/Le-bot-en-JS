import { modifyWrongUsernames } from '../../util/util.js'

export default (client, oldGuildMember, newMGuildMember) => {
	const guild = oldGuildMember.guild || newMGuildMember.guild
	const isBot = oldGuildMember.user.bot || newMGuildMember.user.bot
	if (isBot || guild.id !== client.config.guildID) return

	modifyWrongUsernames(newMGuildMember).catch(() => null)
}
