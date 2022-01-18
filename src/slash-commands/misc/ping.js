import { interactionReply } from '../../util/util.js'

export default {
	name: 'ping',
	description: "Donne le ping de l'API ainsi que du bot",
	requirePermissions: [],
	interaction: async (interaction, client) => {
		await interactionReply({ interaction, content: '🏓 Pong ?' })
		const start = new Date()
		await interactionReply({ interaction, content: '🏓 Pong ?', isEdit: true })
		const editLatency = Math.round(new Date() - start)
		return interactionReply({
			interaction,
			content: `Modification d'un message : **${editLatency} ms**\nRéponse API : **${client.ws.ping} ms**`,
			isEdit: true,
		})
	},
}
