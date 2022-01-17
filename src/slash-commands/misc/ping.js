import { interactionReply } from '../../util/util.js'

export default {
	name: 'ping',
	description: "Donne le ping de l'API ainsi que du bot",
	requirePermissions: [],
	interaction: async (interaction, client) => {
		await interactionReply({ interaction, content: '🏓 Pong ?' })
		return interactionReply({
			interaction,
			content: `Réponse API : **${client.ws.ping} ms**`,
			isEdit: true,
		})
	},
}
