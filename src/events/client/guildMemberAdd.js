const { convertDate } = require('../../util/util')

module.exports = (cient, guildMember) => {
	const leaveJoinChannelId = process.env.LEAVE_JOIN_CHANNEL_ID
	const leaveJoinChannel = guildMember.guild.channels.cache.find(
		channel => channel.id === leaveJoinChannelId,
	)

	leaveJoinChannel.send({
		embed: {
			color: '57C92A',
			author: {
				name: `${guildMember.user.tag} (ID ${guildMember.id})`,
				icon_url: guildMember.user.displayAvatarURL(),
			},
			description: `<@${guildMember.id}>`,
			fields: [
				{
					name: 'Date de création du compte',
					value: convertDate(guildMember.user.createdAt),
					inline: true,
				},
				{
					name: 'Âge du compte',
					value: 'TODO',
					inline: true,
				},
			],
			footer: {
				text: `Un utilisateur a rejoint le serveur • ${convertDate(new Date())}`,
			},
		},
	})
}
