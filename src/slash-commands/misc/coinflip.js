import { interactionReply } from '../../util/util.js'

export default {
	name: 'coinflip',
	description: 'Coinflip! (pile ou face)',
	aliases: [],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	interaction: async interaction => {
		const random = Math.random()

		let resultat = ''
		if (random < 0.49) resultat = 'Pile'
		else if (random > 0.51) resultat = 'Face'
		else resultat = 'Tranche'

		await interactionReply({ interaction, content: 'La pièce tourne.' })
		await interactionReply({ interaction, content: 'La pièce tourne..', isEdit: true })
		return interactionReply({
			interaction,
			content: `La pièce tourne... **${resultat}** !`,
			isEdit: true,
		})
	},
}
