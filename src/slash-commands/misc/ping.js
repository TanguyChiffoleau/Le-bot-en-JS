import { interactionReply } from '../../util/util.js'

export default {
	name: 'ping',
	description: "Donne le ping de l'API ainsi que du bot",
	aliases: [],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	interaction: async (interaction, client) => {
		await interactionReply({ interaction, content: '🏓 Pong ?' })
		return setTimeout(
			() =>
			interactionReply({ interaction, content: `Réponse API : **${client.ws.ping}** ms`, isUpdate: true }),
			250,
		)
	},
}
