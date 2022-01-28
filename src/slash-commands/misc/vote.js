import { SlashCommandBuilder } from '@discordjs/builders'

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
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Édite un message de vote avec la nouvelle proposition')
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

		let messageId = ''
		if (interaction.options.getSubcommand() === 'edit')
			messageId = interaction.options.getString('id')

		// Interaction user
		const user = interaction.guild.members.cache.get(interaction.user.id)

		let sentMessage = ''
		if (interaction.options.getSubcommand() === 'create') {
			// Envoie du message de vote
			sentMessage = await interaction.reply({
				embeds: [
					{
						color: '00FF00',
						author: {
							name: `${interaction.member.displayName} (ID ${interaction.member.id})`,
							icon_url: user.displayAvatarURL({ dynamic: true }),
						},
						title: 'Nouveau vote',
						description: `\`\`\`${proposition}\`\`\``,
						timestamp: new Date(),
					},
				],
				fetchReply: true,
			})

			// Ajout des réactions pour voter
			await sentMessage.react('✅')
			await sentMessage.react('🤷')
			await sentMessage.react('⌛')
			await sentMessage.react('❌')

			// Création automatique du thread associé
			return interaction.channel.threads.create({
				name: `Vote de ${interaction.member.displayName}`,
				autoArchiveDuration: 1440,
				reason: proposition,
			})
		}

		await interaction.channel.messages.fetch(messageId).then(
			msg =>
				msg.edit({
					embeds: [
						{
							color: '00FF00',
							author: {
								name: `${interaction.member.displayName} (ID ${interaction.member.id})`,
								icon_url: user.displayAvatarURL({ dynamic: true }),
							},
							title: 'Nouveau vote (édité)',
							description: `\`\`\`${proposition}\`\`\``,
							timestamp: new Date(),
						},
					],
					fetchReply: true,
				}),

			await interaction.reply({ content: 'Proposition de vote éditée 👌', ephemeral: true }),
		)
	},
}
