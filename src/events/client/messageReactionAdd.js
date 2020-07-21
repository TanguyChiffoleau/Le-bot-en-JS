// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js')
const { convertDate } = require('../../util/util')
/**
 *
 * @param {Discord.Client} client
 * @param {Discord.MessageReaction} messageReaction
 * @param {Discord.User} user
 */

module.exports = async (client, messageReaction, user) => {
	if (messageReaction.partial) await messageReaction.fetch().catch()
	const { message, emoji } = messageReaction

	if (user.bot || emoji.name !== '🚨' || message.channel.type !== 'text') return

	const reportChannel = message.guild.channels.cache.find(
		channel => channel.id === process.env.REPORT_CHANNEL,
	)

	const fetchedMessages = await reportChannel.messages.fetch()

	const logReport = fetchedMessages.find(msg =>
		msg.embeds[0].fields.find(field => field.value.includes(message.id)),
	)

	if (logReport && logReport.embeds[0].fields.some(field => field.value.includes(user.id))) return

	if (logReport)
		switch (logReport.embeds[0].fields.length - 2) {
			case 1:
				logReport.edit({
					embed: {
						color: 'ff8200',
						author: logReport.embeds[0].author,
						description: logReport.embeds[0].description,
						fields: [
							logReport.embeds[0].fields,
							{
								name: '2nd signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						],
						footer: logReport.embeds[0].footer,
					},
				})
				break
			case 2:
				logReport.edit({
					embed: {
						color: 'ff6600',
						author: logReport.embeds[0].author,
						description: logReport.embeds[0].description,
						fields: [
							logReport.embeds[0].fields,
							{
								name: '3ème signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						],
						footer: logReport.embeds[0].footer,
					},
				})
				break
			case 3:
				logReport.edit({
					embed: {
						color: 'ff3200',
						author: logReport.embeds[0].author,
						description: logReport.embeds[0].description,
						fields: [
							logReport.embeds[0].fields,
							{
								name: '4ème signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						],
						footer: logReport.embeds[0].footer,
					},
				})
				messageReaction.message.delete()
				break
			default:
				messageReaction.message.delete()
				break
		}
	else
		switch (messageReaction.count) {
			case 1:
				reportChannel.send({
					embed: {
						color: 'ffae00',
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
								value: `[${message.id}](${message.url})`,
								inline: true,
							},
							{
								name: '1er signalement',
								value: `Signalement de <@${user.id}> le ${convertDate(new Date())}`,
								inline: false,
							},
						],
						footer: {
							text: `Posté le ${convertDate(message.createdAt)}`,
						},
					},
				})
				break
			case 2:
				reportChannel.send({
					embed: {
						color: 'ff8200',
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
								value: `[${message.id}](${message.url})`,
								inline: true,
							},
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
						],
						footer: {
							text: `Posté le ${convertDate(message.createdAt)}`,
						},
					},
				})
				break
			case 3:
				reportChannel.send({
					embed: {
						color: 'ff6600',
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
								value: `[${message.id}](${message.url})`,
								inline: true,
							},
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
						],
						footer: {
							text: `Posté le ${convertDate(message.createdAt)}`,
						},
					},
				})
				break
			case 4:
				reportChannel.send({
					embed: {
						color: 'ff3200',
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
								value: `[${message.id}](${message.url})`,
								inline: true,
							},
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
						],
						footer: {
							text: `Posté le ${convertDate(message.createdAt)}`,
						},
					},
				})
				messageReaction.message.delete()
				break
			default:
				messageReaction.message.delete()
				break
		}
}
