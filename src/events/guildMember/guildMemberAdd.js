import { convertDate, diffDate, modifyWrongUsernames } from '../../util/util.js'

export default (guildMember, client) => {
	if (
		guildMember.user.bot ||
		guildMember.guild.id !== client.config.guildID ||
		!guildMember.guild.available
	)
		return

	modifyWrongUsernames(guildMember).catch(() => null)

	const leaveJoinChannel = guildMember.guild.channels.cache.get(client.config.leaveJoinChannelID)
	if (!leaveJoinChannel) return

	return leaveJoinChannel.send({
		embed: {
			color: '57C92A',
			author: {
				name: `${guildMember.displayName} (ID ${guildMember.id})`,
				icon_url: guildMember.user.displayAvatarURL({ dynamic: true }),
			},
			fields: [
				{
					name: 'Mention',
					value: guildMember,
					inline: true,
				},
				{
					name: 'Date de création du compte',
					value: convertDate(guildMember.user.createdAt),
					inline: true,
				},
				{
					name: 'Âge du compte',
					value: diffDate(guildMember.user.createdAt),
					inline: true,
				},
			],
			footer: {
				text: `Un utilisateur a rejoint le serveur • ${convertDate(new Date())}`,
			},
		},
	})
}
