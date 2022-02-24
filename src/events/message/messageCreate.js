import { Constants } from 'discord.js'
import {
	modifyWrongUsernames,
	convertDate,
	isImage,
	getFileInfos,
	displayNameAndID,
} from '../../util/util.js'

export default async (message, client) => {
	if (
		message.author.bot ||
		(message.guild && (message.guild.id !== client.config.guildID || !message.guild.available))
	)
		return

	if (message.partial) await message.fetch()

	// Si le message vient d'une guild, on vérifie
	if (message.member) {
		// Si le pseudo respecte bien les règles
		modifyWrongUsernames(message.member).catch(() => null)

		// Si c'est un salon autre que blabla
		if (
			message.channel.id !== client.config.blablaChannelID &&
			message.member.roles.cache.has(client.config.joinRoleID)
		)
			message.member.roles.remove(client.config.joinRoleID).catch(error => {
				if (error.code !== Constants.APIErrors.UNKNOWN_MEMBER) throw error
			})
	}

	// Si c'est un salon no-text
	if (
		client.config.noTextManagerChannelIDs.includes(message.channel.id) &&
		message.attachments.size < 1
	) {
		const sentMessage = await message.channel.send(
			`<@${message.author.id}>, tu dois mettre une image / vidéo 😕`,
		)
		return Promise.all([
			message.delete(),
			setTimeout(
				() =>
					sentMessage.delete().catch(error => {
						if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) console.error(error)
					}),
				// Suppression après 7 secondes
				7 * 1000,
			),
		])
	}

	// Si c'est un salon auto-thread
	if (client.config.threadsManagerChannelIDs.includes(message.channel.id) && !message.hasThread)
		// Création automatique du thread associé
		return message.startThread({
			name: `Thread de ${message.member.displayName}`,
			// Archivage après 24H
			autoArchiveDuration: 24 * 60,
		})

	// Répondre émoji si @bot
	if (message.mentions.users.has(client.user.id)) {
		const pingEmoji = client.emojis.cache.find(emoji => emoji.name === 'ping')
		if (pingEmoji) message.react(pingEmoji)
	}

	// Partie citation
	if (message.guild) {
		// Regex pour match les liens Discord
		const regexGlobal =
			/https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19})/g
		const regex =
			/https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19})/

		// Suppression des lignes en citations, pour ne pas afficher la citation
		const matches = message.content.match(regexGlobal)
		if (!matches) return

		const validMessages = (
			await Promise.all(
				// Filtre les liens mennant vers une autre guild
				// ou sur un salon n'existant pas sur la guild
				matches
					.reduce((acc, match) => {
						const [, guildId, channelId, messageId] = regex.exec(match)
						if (guildId !== client.config.guildID) return acc

						const foundChannel = message.guild.channels.cache.get(channelId)
						if (!foundChannel) return acc

						acc.push({ messageId, foundChannel })

						return acc
					}, [])
					// Fetch du message et retourne de celui-ci s'il existe
					.map(async ({ messageId, foundChannel }) => {
						const foundMessage = await foundChannel.messages
							.fetch(messageId)
							.catch(() => null)
						// On ne fait pas la citation si le
						// message n'a ni contenu écrit ni attachments
						if (
							!foundMessage ||
							(!foundMessage.content && !foundMessage.attachments.size)
						)
							return

						return foundMessage
					}),
			)
		)
			// Suppression des messages invalides
			.filter(Boolean)

		const sentMessages = validMessages.map(validMessage => {
			const embed = {
				color: '2f3136',
				author: {
					name: `${displayNameAndID(validMessage.member, validMessage.author)}`,
					icon_url: validMessage.author.displayAvatarURL({ dynamic: true }),
				},
				fields: [],
				footer: {
					text: `Message posté le ${convertDate(validMessage.createdAt)}`,
				},
			}

			const description = `${validMessage.content}\n[Aller au message](${validMessage.url}) - ${validMessage.channel}`
			// Si la description dépasse la limite
			// autorisée, les liens sont contenus dans des fields
			if (description.length > 4096) {
				embed.description = validMessage.content
				embed.fields.push(
					{
						name: 'Message',
						value: `[Aller au message](${validMessage.url})`,
						inline: true,
					},
					{
						name: 'Salon',
						value: validMessage.channel.toString(),
						inline: true,
					},
				)
			} else {
				embed.description = description
			}

			if (validMessage.editedAt)
				embed.footer.text += `\nModifié le ${convertDate(validMessage.editedAt)}`

			if (message.author !== validMessage.author) {
				embed.footer.icon_url = message.author.displayAvatarURL({ dynamic: true })
				embed.footer.text += `\nCité par ${displayNameAndID(
					message.member,
					message.author,
				)} le ${convertDate(message.createdAt)}`
			}

			// Partie pour gérer les attachments
			const attachments = validMessage.attachments
			if (attachments.size === 1 && isImage(attachments.first().name))
				embed.image = { url: attachments.first().url }
			else
				attachments.forEach(attachment => {
					const { name, type } = getFileInfos(attachment.name)
					embed.fields.push({
						name: `Fichier ${type}`,
						value: `[${name}](${attachment.url})`,
						inline: true,
					})
				})

			return message.channel.send({ embeds: [embed] })
		})

		// Si le message ne contient que un(des) lien(s),
		// on supprime le message, ne laissant que les embeds
		if (
			!message.content.replace(regexGlobal, '').trim() &&
			sentMessages.length === matches.length
		) {
			client.cache.deleteMessagesID.add(message.id)
			return message.delete()
		}
	}
}
