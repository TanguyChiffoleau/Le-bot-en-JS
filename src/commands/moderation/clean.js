/* eslint-disable no-await-in-loop */
const {
	pluralizeWithoutQuantity: pluralize,
	convertDate,
	convertDateToHours,
} = require('../../util/util')
const { Util } = require('discord.js')

module.exports = {
	name: 'clean',
	description: 'Supprime un nombre de de messages donné dans le channel',
	aliases: ['cl'],
	isEnabled: true,
	needArguments: true,
	guildOnly: true,
	requirePermissions: ['MANAGE_MESSAGES'],
	execute: async (client, message, args) => {
		// Acquisition du nombre de messages à supprimer
		const chosenNumber = parseInt(args[0], 10)
		if (!chosenNumber) return message.reply("tu n'as pas donné un nombre 😕")
		if (chosenNumber < 1 || chosenNumber > 99)
			return message.reply("tu n'as pas donné un nombre compris entre 1 et 99 inclus 😕")
		const numberUsed = chosenNumber + 1

		// Acquisition du channel de logs
		const logsChannel = message.guild.channels.cache.get(client.config.logsChannelID)
		if (!logsChannel) return message.reply("il n'y a pas de channel pour log l'action 😕")

		// Acquisition et filtrage des messages épinglés
		const fetchedMessages = (
			await message.channel.messages.fetch({ limit: numberUsed })
		).filter(fetchedMessage => !fetchedMessage.pinned)

		// Suppression des messages
		const deletedMessages = await message.channel.bulkDelete(fetchedMessages, true)
		if (deletedMessages.size === 1) return message.reply('aucun message supprimé 😕')

		// Réponse pour l'utilisateur
		message.channel.send(
			`${deletedMessages.size} ${pluralize('message', deletedMessages.size)} ${pluralize(
				'supprimé',
				deletedMessages.size,
			)} 👌`,
		)

		// Partie logs //
		// Tri décroissant en fonction de l'heure à laquelle le message a été
		// posté pour avoir une lecture du haut vers le bas comme sur discord
		const text = deletedMessages
			.sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp)
			.reduce(
				(acc, deletedMessage) =>
					`${acc}[${convertDateToHours(deletedMessage.createdAt)}] ${
						deletedMessage.member
					}: ${deletedMessage.content}\n`,
				'',
			)

		// Envoie plusieurs embeds si il ne tient pas dans un seul embed
		if (text.length > 2048) {
			// Séparation des messages pour 3 embeds :
			// 1er : titre + 1ère partie des messages
			// 2nd : 2nd partie des messsages
			// 3ème: 3ème partie des messages + fields exécuté par/le et channel
			const splitedDescriptions = Util.splitMessage(text, { maxLength: 2048 })
			const firstDescription = splitedDescriptions.shift()
			const lastDescription = splitedDescriptions.pop()

			await logsChannel.send({
				embed: {
					color: '0000ff',
					author: {
						name: `${message.member.displayName} (ID ${message.member.id})`,
						icon_url: message.author.displayAvatarURL({ dynamic: true }),
					},
					title: 'Clean',
					description: firstDescription,
				},
			})

			for (const description of splitedDescriptions)
				await logsChannel.send({
					embed: {
						color: '0000ff',
						description: description,
					},
				})

			return logsChannel.send({
				embed: {
					color: '0000ff',
					description: lastDescription,
					fields: [
						{
							name: 'Exécuté par',
							value: message.member,
							inline: true,
						},
						{
							name: 'Channel',
							value: message.channel,
							inline: true,
						},
						{
							name: 'Exécuté le',
							value: convertDate(new Date()),
							inline: true,
						},
					],
				},
			})
		}

		// Si les messages tiennent dans un seul embed
		return logsChannel.send({
			embed: {
				color: '0000ff',
				author: {
					name: `${message.member.displayName} (ID ${message.member.id})`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				title: 'Clean',
				description: text,
				fields: [
					{
						name: 'Exécuté par',
						value: message.member,
						inline: true,
					},
					{
						name: 'Channel',
						value: message.channel,
						inline: true,
					},
					{
						name: 'Exécuté le',
						value: convertDate(new Date()),
						inline: true,
					},
				],
			},
		})
	},
}
