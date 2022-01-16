import { interactionReply } from '../../util/util.js'

export default {
	name: 'vote',
	description: 'Créé un embed avec la proposition et des émojis pour voter',
	aliases: [],
	options: [
		{
			type: 'input',
			name: 'proposition',
			optDesc: 'Proposition de vote',
		},
	],
	usage: {
		arguments: '<texte>',
		informations: null,
		examples: [],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: [],
	interaction: async interaction => {
		const proposition = interaction.options.getString('proposition')
		if (!proposition)
			return interactionReply({
				interaction,
				content: 'tu dois entrer une proposition de vote 😕',
				isSilent: true,
			})

		// Interaction user
		const user = interaction.guild.members.cache.get(interaction.user.id)

		// Envoie du message de vote
		const sentMessage = await interactionReply({
			interaction,
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
			autoArchiveDuration: 60,
			reason: `${proposition}`,
		})

		// Ajout des réactions pour voter
		await sentMessage.react('✅')
		await sentMessage.react('🤷')
		await sentMessage.react('⌛')
		return sentMessage.react('❌')
	},
}
