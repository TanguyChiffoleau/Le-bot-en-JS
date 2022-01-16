import { interactionReply } from '../../util/util.js'

export default {
	name: 'coinflip',
	description: 'Coinflip! (pile ou face)',
	aliases: [],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const random = Math.random()

		let resultat = ''
		if (random < 0.49) resultat = 'Pile'
		else if (random > 0.51) resultat = 'Face'
		else resultat = 'Tranche'

		await interactionReply({ interaction, content: 'La pièce tourne.' })
		setTimeout(
			() =>
			interactionReply({ interaction, content: 'La pièce tourne..', isUpdate: true }),
			client.ws.ping * 3,
		)
		setTimeout(
			() =>
			interactionReply({ interaction, content: `La pièce tourne... **${resultat}** !`, isUpdate: true }),
			client.ws.ping * 3,
		)
	},
}
