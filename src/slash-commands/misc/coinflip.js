import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder().setName('coinflip').setDescription('Coinflip! (pile ou face)'),
	requirePermissions: [],
	interaction: async interaction => {
		const random = Math.round(Math.random() * 100)

		let resultat = ''
		if (random < 50) resultat = 'Pile'
		else if (random > 50) resultat = 'Face'
		else resultat = 'Tranche'

		await interaction.reply({ interaction, content: 'La pièce tourne.' })
		await interaction.editReply({ interaction, content: 'La pièce tourne..' })
		return interaction.editReply({
			interaction,
			content: `La pièce tourne... **${resultat}** !`,
		})
	},
}
