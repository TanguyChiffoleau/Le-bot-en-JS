const { convertDate } = require('../../util/util')

module.exports = async (client, message) => {
	if (message.partial) return

	if (
		message.author.bot ||
		!message.guild ||
		message.guild.id !== client.config.guildID ||
		client.cache.deleteMessagesID.has(message.id)
	)
		return

	const logsChannel = message.guild.channels.cache.find(
		channel => channel.id === client.config.logsChannelID,
	)

	const fetchedLogs = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 1 })

	const deletionLog = fetchedLogs.entries.first()

	if (!deletionLog) return

	const { executor, target, extra } = deletionLog

	const embed = {
		author: {
			icon_url: message.author.displayAvatarURL({ dynamic: true }),
		},
		fields: [
			{
				name: 'Auteur',
				value: message.author,
				inline: true,
			},
			{
				name: 'Channel',
				value: message.channel,
				inline: true,
			},
			{
				name: 'Posté le',
				value: convertDate(message.createdAt),
				inline: true,
			},
		],
	}

	if (
		extra.channel.id === message.channel.id &&
		target.id === message.author.id &&
		deletionLog.createdTimestamp > Date.now() - 5000 &&
		extra.count >= 1
	) {
		embed.color = 'fc3c3c'
		embed.footer = {
			icon_url: executor.displayAvatarURL({ dynamic: true }),
			text: `Supprimé par: ${executor.tag}\nDate de suppression: ${convertDate(new Date())}`,
		}
	} else {
		embed.color = '00FF00'
		embed.footer = {
			text: `Date de suppression: ${convertDate(new Date())}`,
		}
	}

	const title = []

	if (message.cleanContent) {
		title.push('Message')
		embed.description = `\`\`\`\n${message.cleanContent.replace(/`{3}/g, "'''")}\`\`\``
	}

	const { attachements } = message
	if (attachements.size > 0)
		if (attachements.size === 1) {
			const file = attachements.first()
			const format = file.name.split('.').pop().toLowerCase()
			if (format.match(/png|jpeg|jpg|gif|webp/)) title.push('Image')
			else title.push('Attachement')
		}

	embed.author.name = `${title.join(' + ')} supprimé${title.length > 1 ? 's' : ''}`
	return logsChannel.send({ embed })
}
