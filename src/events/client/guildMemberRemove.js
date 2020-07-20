const { convertDate } = require('../../util/util')

module.exports = (cient, guildMember) => {
	if (guildMember.guild.id !== process.env.GUILD_ID) return

	const leaveJoinChannelId = process.env.LEAVE_JOIN_CHANNEL_ID
	const leaveJoinChannel = guildMember.guild.channels.cache.find(
		channel => channel.id === leaveJoinChannelId,
	)

	leaveJoinChannel.send({
		embed: {
			color: 'C9572A',
			author: {
				name: `${guildMember.user.tag} (ID ${guildMember.id})`,
				icon_url: guildMember.user.displayAvatarURL(),
			},
			footer: {
				text: `Un utilisateur a quitté le serveur • ${convertDate(new Date())}`,
			},
		},
	})
}
