/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
import { SlashCommandBuilder } from '@discordjs/builders'
import { Constants } from 'discord.js'
import { convertDate } from '../../util/util.js'

export default {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Gère les votes')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Crée un embed avec la proposition et des émojis pour voter')
				.addStringOption(option =>
					option
						.setName('proposition')
						.setDescription('Proposition de vote')
						.setRequired(true),
				)
				.addBooleanOption(option =>
					option
						.setName('thread')
						.setDescription('Voulez-vous créer un thread associé ?')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Modifie un message de vote avec la nouvelle proposition')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('ID de la proposition à éditer')
						.setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('proposition')
						.setDescription('Nouvelle proposition de vote')
						.setRequired(true),
				),
		),
	requirePermissions: [],
	interaction: async interaction => {
		const proposition = interaction.options.getString('proposition')
		const thread = interaction.options.getBoolean('thread')

		switch (interaction.options.getSubcommand()) {
			case 'create':
				// Envoie du message de vote
				const sentMessage = await interaction.reply({
					embeds: [
						{
							color: '00FF00',
							author: {
								name: `${interaction.member.displayName} (ID ${interaction.member.id})`,
								icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
							},
							title: 'Nouveau vote',
							description: `\`\`\`${proposition}\`\`\``,
							footer: {
								text: `Vote posté le ${convertDate(new Date())}`,
							},
						},
					],
					fetchReply: true,
				})

				// Création automatique du thread associé
				if (thread)
					await interaction.channel.threads.create({
						name: `Vote de ${interaction.member.displayName}`,
						// Archivage après 24H
						autoArchiveDuration: 24 * 60,
						reason: proposition,
					})

				// Ajout des réactions pour voter
				await sentMessage.react('✅')
				await sentMessage.react('🤷')
				await sentMessage.react('⌛')
				return sentMessage.react('❌')
			case 'edit':
				const receivedID = interaction.options.getString('id')
				const matchID = receivedID.match(/^(\d{17,19})$/)
				if (!matchID)
					return interaction.reply({
						content: "Tu ne m'as pas donné un ID valide 😕",
						ephemeral: true,
					})

				const message = await interaction.channel.messages
					.fetch(matchID[0])
					.catch(error => {
						if (error.code === Constants.APIErrors.UNKNOWN_MESSAGE) {
							interaction.reply({
								content: "Je n'ai pas trouvé ce message dans ce channel 😕",
								ephemeral: true,
							})

							return error
						}

						throw error
					})
				if (message instanceof Error) return

				if (!message.interaction || message.interaction.commandName !== 'vote')
					return interaction.reply({
						content: "Le message initial n'est pas un vote 😕",
						ephemeral: true,
					})

				await message.edit({
					embeds: [
						{
							color: '00FF00',
							author: {
								name: `${interaction.member.displayName} (ID ${interaction.member.id})`,
								icon_url: interaction.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							title: 'Nouveau vote (édité)',
							description: `\`\`\`${proposition}\`\`\``,
							footer: {
								text: `Vote posté le ${convertDate(
									message.createdAt,
								)}\nÉdité le ${convertDate(new Date())}`,
							},
						},
					],
				})

				return interaction.reply({
					content: 'Proposition de vote éditée 👌',
					ephemeral: true,
				})
		}
	},
}
