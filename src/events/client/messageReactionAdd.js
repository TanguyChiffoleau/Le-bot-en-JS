const { convertDate } = require('../../util/util')

module.exports = async (client, messageReaction, user) => {
	if (messageReaction.partial) await messageReaction.fetch().catch()
	const { message, emoji } = messageReaction

	if (user.bot || (message.guild && message.guild.id !== process.env.GUILD_ID)) return

	switch (emoji.name) {
		case '🚨': {
			if (message.author === user || message.author.bot || message.channel.type !== 'text')
				return

			const reportChannel = message.guild.channels.cache.find(
				channel => channel.id === process.env.REPORT_CHANNEL,
			)

			const fetchedMessages = await reportChannel.messages.fetch()

			const logReport = fetchedMessages.find(msg =>
				msg.embeds[0].fields.find(field => field.value.includes(message.id)),
			)

			if (logReport) {
				if (logReport.embeds[0].fields.some(field => field.value.includes(user.id))) return
				const editLogReport = {
					embed: {
						author: logReport.embeds[0].author,
						description: logReport.embeds[0].description,
						fields: [logReport.embeds[0].fields],
						footer: logReport.embeds[0].footer,
					},
				}
				switch (logReport.embeds[0].fields.length - 2) {
					case 1:
						editLogReport.embed.color = 'ff8200'
						editLogReport.embed.fields.push({
							name: '2nd signalement',
							value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
							inline: false,
						})
						break
					case 2:
						editLogReport.embed.color = 'ff6600'
						editLogReport.embed.fields.push({
							name: '3ème signalement',
							value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
							inline: false,
						})
						break
					case 3:
						editLogReport.embed.color = 'ff3200'
						editLogReport.embed.fields.push({
							name: '4ème signalement',
							value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
							inline: false,
						})
						messageReaction.message.delete()
						break
					default:
						messageReaction.message.delete()
						break
				}
				logReport.edit(editLogReport)
			} else {
				const sendLogReport = {
					embed: {
						author: {
							name: `${message.author.tag} (ID ${message.author.id})`,
							icon_url: message.author.displayAvatarURL({ dynamic: true }),
						},
						description: `**Contenu du message**\n${message.cleanContent}`,
						fields: [
							{
								name: 'Channel',
								value: message.channel,
								inline: true,
							},
							{
								name: 'Message',
								value: `[Aller au message](${message.url})`,
								inline: true,
							},
						],
						footer: {
							text: `Message posté le ${convertDate(message.createdAt)}`,
						},
					},
				}
				switch (messageReaction.count) {
					case 1:
						sendLogReport.embed.color = 'ffae00'
						sendLogReport.embed.fields.push({
							name: '1er signalement',
							value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
							inline: false,
						})
						break
					case 2:
						sendLogReport.embed.color = 'ff8200'
						sendLogReport.embed.fields.push(
							{
								name: '1er signalement',
								value: '?',
								inline: false,
							},
							{
								name: '2nd signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						)
						break
					case 3:
						sendLogReport.embed.color = 'ff6600'
						sendLogReport.embed.fields.push(
							{
								name: '1er signalement',
								value: '?',
								inline: false,
							},
							{
								name: '2nd signalement',
								value: '?',
								inline: false,
							},
							{
								name: '3ème signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						)
						break
					case 4:
						sendLogReport.embed.color = 'ff3200'
						sendLogReport.embed.fields.push(
							{
								name: '1er signalement',
								value: '?',
								inline: false,
							},
							{
								name: '2nd signalement',
								value: '?',
								inline: false,
							},
							{
								name: '3ème signalement',
								value: '?',
								inline: false,
							},
							{
								name: '4ème signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						)
						messageReaction.message.delete()
						break
					default:
						messageReaction.message.delete()
						break
				}
				reportChannel.send(sendLogReport)
			}
			break
		}

		default:
			break
	}
}
