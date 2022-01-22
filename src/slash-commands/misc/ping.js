import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Donne le ping de l'API ainsi que du bot"),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		await interaction.reply({ interaction, content: '🏓 Pong ?' })
		const start = new Date()
		await interaction.editReply({ interaction, content: '🏓 Pong ?' })
		const editLatency = Math.round(new Date() - start)
		return interaction.editReply({
			interaction,
			content: `Modification d'un message : **${editLatency} ms**\nRéponse API : **${client.ws.ping} ms**`,
		})
	},
}
