import {
	pluralizeWithoutQuantity as pluralize,
	displayNameAndID,
	convertDateForDiscord,
} from '../../util/util.js'
import { Util } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

const isEmbedExceedingLimits = embeds =>
	embeds.reduce((acc, { title, description, fields, footer, author }) => {
		let sum = 0
		if (title) sum += title.length
		if (description) sum += description.length
		if (fields && fields.length > 0)
			sum += fields.reduce(
				(accBis, field) => accBis + field.name.length + field.value.length,
				0,
			)
		if (footer) sum += footer.text.length
		if (author) sum += author.name.length

		return acc + sum
	}, 0) > 6000

export default {
	data: new SlashCommandBuilder()
		.setName('clean')
		.setDescription('Supprime un nombre de messages donné dans le channel')
		.addIntegerOption(option =>
			option
				.setName('nombre')
				.setDescription('Nombre de message à supprimer (1 à 99)')
				.setRequired(true),
		)
		.addBooleanOption(option =>
			option.setName('silent').setDescription('Exécuter la commande silencieusement'),
		),
	requirePermissions: ['MANAGE_MESSAGES'],
	interaction: async (interaction, client) => {
		// Acquisition du nombre de messages à supprimer et du silent
		const chosenNumber = interaction.options.getInteger('nombre')
		const ephemeral = interaction.options.getBoolean('silent')

		if (!chosenNumber)
			return interaction.reply({
				content: "tu n'as pas donné un nombre 😕",
				ephemeral: ephemeral,
			})

		if (chosenNumber < 1 || chosenNumber > 99)
			return interaction.reply({
				content: "tu n'as pas donné un nombre compris entre 1 et 99 inclus 😕",
				ephemeral: ephemeral,
			})

		// Acquisition du channel de logs
		const logsChannel = interaction.guild.channels.cache.get(
			client.config.logsMessagesChannelID,
		)
		if (!logsChannel)
			return interaction.reply({
				content: "il n'y a pas de channel pour log l'action 😕",
				ephemeral: ephemeral,
			})

		// Acquisition des messages et filtrage des épinglés
		const fetchedMessages = (
			await interaction.channel.messages.fetch({ limit: chosenNumber })
		).filter(fetchedMessage => !fetchedMessage.pinned)

		// Suppression des messages
		const deletedMessages = await interaction.channel.bulkDelete(fetchedMessages, true)
		// Exclusion du message de la commande
		deletedMessages.delete(interaction.id)
		if (deletedMessages.size === 0)
			return interaction.reply({
				content: 'aucun message supprimé 😕',
				ephemeral: ephemeral,
			})

		// Réponse pour l'utilisateur sauf si argument "silent" utilisé
		const { size: nbDeletedMessages } = deletedMessages
		await interaction.reply({
			content: `${nbDeletedMessages} ${pluralize('message', nbDeletedMessages)} ${pluralize(
				'supprimé',
				nbDeletedMessages,
			)} 👌`,
			ephemeral: ephemeral,
		})

		// Partie logs
		// Tri décroissant en fonction de l'heure à laquelle le message a été
		// posté pour avoir une lecture du haut vers le bas comme sur discord
		const text = deletedMessages
			.sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp)
			.reduce(
				(acc, deletedMessage) =>
					`${acc}${convertDateForDiscord(deletedMessage.createdAt)} ${
						deletedMessage.member
					}: ${deletedMessage.content}\n`,
				'',
			)

		// Envoie plusieurs embeds si les logs ne tient pas dans un seul embed
		if (text.length > 4096) {
			// Séparation des messages pour 3 embeds :
			// 1er : titre + 1ère partie des messages
			// 2nd : 2nd partie des messsages
			// 3ème: 3ème partie des messages + fields exécuté par/le et channel
			const splitedDescriptions = Util.splitMessage(text, { maxLength: 4096 })
			const firstDescription = splitedDescriptions.shift()
			const lastDescription = splitedDescriptions.pop()

			const embeds = [
				{
					color: '0000ff',
					author: {
						name: `${displayNameAndID(interaction.member, interaction.user)}`,
						icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
					},
					title: 'Clean',
					description: firstDescription,
				},
				...splitedDescriptions.map(description => ({
					color: '0000ff',
					description: description,
				})),
				{
					color: '0000ff',
					description: lastDescription,
					fields: [
						{
							name: 'Channel',
							value: interaction.channel.toString(),
							inline: true,
						},
						{
							name: 'Exécuté par',
							value: interaction.member.toString(),
							inline: true,
						},
						{
							name: 'Exécuté le',
							value: convertDateForDiscord(Date.now()),
							inline: true,
						},
					],
				},
			]

			if (!isEmbedExceedingLimits(embeds)) return logsChannel.send({ embeds: embeds })

			// eslint-disable-next-line no-await-in-loop
			for (const embed of embeds) await logsChannel.send({ embeds: [embed] })

			return
		}

		// Si les messages tiennent dans un seul embed
		return logsChannel.send({
			embeds: [
				{
					color: '0000ff',
					author: {
						name: `${displayNameAndID(interaction.member, interaction.user)}`,
						icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
					},
					title: 'Clean',
					description: text,
					fields: [
						{
							name: 'Channel',
							value: interaction.channel.toString(),
							inline: true,
						},
						{
							name: 'Exécuté par',
							value: interaction.member.toString(),
							inline: true,
						},
						{
							name: 'Exécuté le',
							value: convertDateForDiscord(Date.now()),
							inline: true,
						},
					],
				},
			],
		})
	},
}
