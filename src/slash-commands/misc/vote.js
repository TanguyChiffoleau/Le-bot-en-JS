import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Créé un embed avec la proposition et des émojis pour voter')
		.addStringOption(option =>
			option.setName('proposition').setDescription('Proposition de vote').setRequired(true),
		),
	requirePermissions: [],
	interaction: async interaction => {
		const proposition = interaction.options.getString('proposition')

		// Interaction user
		const user = interaction.guild.members.cache.get(interaction.user.id)

		// Envoie du message de vote
		const sentMessage = await interaction.reply({
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

		// Création automatique du thread associé
		await interaction.channel.threads.create({
			name: `Vote de ${interaction.member.displayName}`,
			autoArchiveDuration: 1440,
			reason: proposition,
		})

		// Ajout des réactions pour voter
		await sentMessage.react('✅')
		await sentMessage.react('🤷')
		await sentMessage.react('⌛')
		return sentMessage.react('❌')
	},
}
