const { Collection } = require('discord.js')
const { modifyWrongUsernames, convertDate, isImage, getFileInfos } = require('../../util/util')
const { getPool } = require('../../util/database')
const { sql } = require('slonik')

module.exports = async (client, message) => {
	if (
		message.author.bot ||
		(message.guild && (message.guild.id !== client.config.guildID || !message.guild.available))
	)
		return

	// Si le message vient d'une guild, on vérifie
	// si le pseudo respecte bien les règles
	if (message.member) modifyWrongUsernames(message.member)

	// Command handler
	if (message.content.startsWith(client.config.prefix)) {
		const args = message.content.slice(client.config.prefix.length).split(/ +/)
		const commandName = args.shift().toLowerCase()
		const command =
			client.commands.get(commandName) ||
			client.commands.find(({ aliases }) => aliases.includes(commandName))

		if (!command) return

		// Partie cooldown
		if (!client.cooldowns.has(commandName)) client.cooldowns.set(command.name, new Collection())
		const now = Date.now()
		const timestamps = client.cooldowns.get(command.name)
		const cooldownAmount = (command.cooldown || 4) * 1000
		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount
			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000
				return message.reply(
					`merci d'attendre ${timeLeft.toFixed(
						1,
					)} seconde(s) de plus avant de réutiliser la commande \`${command.name}\`.`,
				)
			}
		}
		timestamps.set(message.author.id, now)
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

		// Si c'est une command custom
		if (command.id) {
			message.channel.startTyping()
			await message.channel.send(command.texte)
			message.channel.stopTyping(true)
			return getPool().query(
				sql`UPDATE "Custom commands" SET utilisations= utilisations + 1 WHERE id = ${command.id}`,
			)
		}

		// Sinon c'est une commande classique
		// Rejets de la commandes
		if (command.needArguments && !args.length)
			return message.reply("tu n'as pas donné d'argument(s) 😕")

		if (command.guildOnly && !message.guild)
			return message.reply(
				'Je ne peux pas exécuter cette commande dans les messages privés 😕',
			)

		if (
			command.requirePermissions.length > 0 &&
			!message.member.permissionsIn(message.channel).has(command.requirePermissions)
		)
			return message.reply("tu n'as pas les permissions d'effectuer cette commande 😕")

		// Exécution de la commande
		try {
			message.channel.startTyping()
			await command.execute(client, message, args)
			return message.channel.stopTyping(true)
		} catch (error) {
			message.channel.stopTyping(true)
			message.reply('il y a eu une erreur en exécutant la commande 😬')
			console.error(error)
		}

		// Partie citation
	} else if (message.guild) {
		// Regex pour match les liens discord
		const regexGlobal = /(?<!<)(?:https:\/\/(?:canary\.)?discord(?:app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19}))(?!>)/g
		const regex = /(?<!<)(?:https:\/\/(?:canary\.)?discord(?:app)?\.com\/channels\/(\d{17,19})\/(\d{17,19})\/(\d{17,19}))(?!>)/

		// Suppression des lignes en citations, pour ne pas afficher la citation
		const matches = message.content.replace(/^> .*$/gm, '').match(regexGlobal)
		if (!matches) return

		const validMessages = (
			await Promise.all(
				// Filtre les liens mennant vers une autre guild
				// ou sur un channel n'existant pas sur la guild
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
						// message n'a ni contenu écrit ni attachements
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
					name: `${validMessage.member.displayName} (ID ${validMessage.member.id})`,
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
			if (description.length > 2048) {
				embed.description = validMessage.content
				embed.fields.push(
					{
						name: 'Message',
						value: `[Aller au message](${validMessage.url})`,
						inline: true,
					},
					{
						name: 'Channel',
						value: validMessage.channel,
						inline: true,
					},
				)
			} else {
				embed.description = description
			}

			if (validMessage.editedAt)
				embed.footer.text += ` et modifié le ${convertDate(validMessage.editedAt)}`

			if (message.author !== validMessage.author) {
				embed.footer.icon_url = message.author.displayAvatarURL({ dynamic: true })
				embed.footer.text += `\nCité par ${message.member.displayName} (ID ${
					message.author.id
				}) le ${convertDate(message.createdAt)}`
			}

			// Partie pour gérer les attachements
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

			return message.channel.send({ embed })
		})

		// Si le message ne contenais que un(des) lien(s),
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
