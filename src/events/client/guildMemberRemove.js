const { convertDate, diffDate } = require('../../util/util')

module.exports = (cient, guildMember) => {
	if (guildMember.guild.id !== process.env.GUILD_ID) return

	const leaveJoinChannel = guildMember.guild.channels.cache.find(
		channel => channel.id === process.env.LEAVE_JOIN_CHANNEL_ID,
	)

	leaveJoinChannel.send({
		embed: {
			color: 'C9572A',
			author: {
				name: `${guildMember.user.tag} (ID ${guildMember.id})`,
				icon_url: guildMember.user.displayAvatarURL({ dynamic: true }),
			},
			fields: [
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
				text: `Un utilisateur a quitté le serveur • ${convertDate(new Date())}`,
			},
		},
	})
}
