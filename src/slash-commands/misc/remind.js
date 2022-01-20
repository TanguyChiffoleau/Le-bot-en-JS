import { interactionReply } from '../../util/util.js'
import ms from 'ms'

export default {
	name: 'remind',
	description: 'Défini un rappel',
	options: [
		{
			type: 'input',
			name: 'temps',
			optDesc: 'Rappel dans combien de temps',
		},
		{
			type: 'input',
			name: 'rappel',
			optDesc: 'Rappel à définir',
		},
		{
			type: 'bool',
			name: 'silent',
			optDesc: 'Exécuter la commande silencieusement',
		},
	],
	requirePermissions: [],
	interaction: async interaction => {
		// Acquisition du membre et du rappel
		const user = interaction.guild.members.cache.get(interaction.user.id)
		const temps = interaction.options.getString('temps')
		const rappel = interaction.options.getString('rappel')
		const isSilent = interaction.options.getBoolean('silent')

		if (temps === null)
			return interactionReply({
				interaction,
				content: 'tu dois entrer une valeur de durée 😬',
				isSilent: isSilent,
			})

		if (!rappel)
			return interactionReply({
				interaction,
				content: 'tu dois donner un rappel 😬',
				isSilent: isSilent,
			})

		// Utilisation de la lib 'ms' afin de pouvoir définir
		// un temps de rappel sous la forme : 1h, 2 days, 3m, etc.
		// https://www.npmjs.com/package/ms
		const setRemind = setTimeout(
			() =>
				interactionReply({
					interaction,
					content: `Rappel pour ${user} : ${rappel}`,
					isSilent: isSilent,
				}),
			`${ms(temps)}`,
		)

		// Si au moins une erreur, throw
		if (setRemind instanceof Error)
			throw new Error(
				'Sending message and/or banning member failed. See precedents logs for more informations.',
			)
		else
			await interactionReply({
				interaction,
				content: `Rappel défini prévu pour le <t:${Math.round(
					new Date(Date.now() + ms(temps)).getTime() / 1000,
				)}> 👌`,
				isSilent: isSilent,
			})
	},
}
