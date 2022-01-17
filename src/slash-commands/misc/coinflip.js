import { interactionReply } from '../../util/util.js'

export default {
	name: 'coinflip',
	description: 'Coinflip! (pile ou face)',
	requirePermissions: [],
	interaction: async interaction => {
		const random = Math.round(Math.random() * 100)

		let resultat = ''
		if (random < 50) resultat = 'Pile'
		else if (random > 50) resultat = 'Face'
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
