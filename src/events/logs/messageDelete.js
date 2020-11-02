const { convertDate, pluralizeWithoutQuantity: isImage } = require('../../util/util')
const { MessageAttachment, Util } = require('discord.js')
const bent = require('bent')

const getLinkBuffer = url => {
	const getBuffer = bent('buffer')
	return getBuffer(url)
}

module.exports = async (client, message) => {
	if (
		message.partial ||
		message.author.bot ||
		!message.guild ||
		message.guild.id !== client.config.guildID ||
		client.cache.deleteMessagesID.has(message.id)
	)
		return

	// Acquisition du channel pour les logs
	const logsChannel = message.guild.channels.cache.get(client.config.logsChannelID)
	if (!logsChannel) return

	// Fetch du message supprimé
	const fetchedLog = (
		await message.guild.fetchAuditLogs({
			type: 'MESSAGE_DELETE',
			limit: 1,
		})
	).entries.first()
	if (!fetchedLog) return

	const logEmbed = {
		author: {
			name: `${message.member.displayName} (ID ${message.member.id})`,
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

	const { executor, target, extra } = fetchedLog

	// Détermination si le message a été supprimé par
	// celui qui l'a posté ou par un modérateur
	if (
		extra.channel.id === message.channel.id &&
		target.id === message.author.id &&
		fetchedLog.createdTimestamp > Date.now() - 5000 &&
		extra.count >= 1
	) {
		logEmbed.color = 'fc3c3c'
		logEmbed.footer = {
			icon_url: executor.displayAvatarURL({ dynamic: true }),
			text: `Date de suppression: ${convertDate(new Date())}\nSupprimé par ${executor.tag}`,
		}
	} else {
		logEmbed.color = '00FF00'
		logEmbed.footer = {
			text: `Date de suppression: ${convertDate(new Date())}`,
		}
	}

	// Partie contenu écrit du message
	if (message.content) {
		const escapedCleanContent = Util.escapeCodeBlock(message.cleanContent)
		logEmbed.description = `\`\`\`\n${escapedCleanContent}\`\`\``
	}

	// Partie attachements (fichiers, images...)
	const messageAttachments = []
	const attachments = message.attachments
	if (attachments.size <= 0) return logsChannel.send({ embed: logEmbed })

	// Séparation des images et des autres fichiers
	const [imageAttachments, otherAttachments] = attachments.partition(attachment =>
		isImage(attachment.name),
	)

	// Partie image
	// Étant donné que les données sont supprimées de discord
	// avant de recevoir l'event, il est possible de récupérer
	// les images via les proxy car elles resent disponibles quelques
	// temps après la suppression du message
	if (imageAttachments.size === 1) {
		const image = imageAttachments.first()
		logEmbed.image = {
			url: `attachment://${image.name}`,
		}
		const buffer = await getLinkBuffer(image.proxyURL)
		const messageAttachment = new MessageAttachment(buffer, image.name)
		messageAttachments.push(messageAttachment)
	} else {
		for (const [, attachment] of imageAttachments) {
			// eslint-disable-next-line no-await-in-loop
			const buffer = await getLinkBuffer(attachment.proxyURL)
			const messageAttachment = new MessageAttachment(buffer, attachment.name)
			messageAttachments.push(messageAttachment)
		}
	}

	// Partie fichiers
	// Étant donné que les données sont supprimées de discord
	// avant de recevoir l'event, il est impossible de récupérer
	// les données pour pouvoir les logs
	// TODO : trouver une solution
	for (const [, attachment] of otherAttachments) {
		const attachmentNameSplited = attachment.name.split('.')
		const attachmentType = attachmentNameSplited.pop()
		logEmbed.fields.push({
			name: `Fichier ${attachmentType}`,
			value: attachmentNameSplited,
			inline: true,
		})
	}

	return logsChannel.send({ files: messageAttachments, embed: logEmbed })
}
