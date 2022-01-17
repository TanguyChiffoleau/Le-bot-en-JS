import { convertSecondsToString, interactionReply } from '../../util/util.js'
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
	name: 'cooldown',
	description: 'Active le mode lent sur le channel',
	options: [
		{
			type: 'int',
			name: 'attente',
			optDesc: "Nom de secondes d'attente",
		},
		{
			type: 'int',
			name: 'durée',
			optDesc: 'Nombre de secondes de la durée',
		},
		{
			type: 'bool',
			name: 'silent',
			optDesc: 'Exécuter la commande silencieusement',
		},
	],
	requirePermissions: ['MANAGE_MESSAGES'],
	interaction: async interaction => {
		const attente = interaction.options.getInteger('attente')
		const duree = interaction.options.getInteger('durée')
		const isSilent = interaction.options.getBoolean('silent')

		if (attente === null)
			return interactionReply({
				interaction,
				content: "tu dois entrer une valeur d'attente 😬",
				isSilent: true,
			})

		// Supprime le cooldown avec 0 seconde
		if (attente === 0) {
			if (interaction.channel.rateLimitPerUser > 0) {
				await interaction.channel.setRateLimitPerUser(0)
				return interactionReply({
					interaction,
					content: 'Slowmode désactivé 👌',
					isSilent: isSilent,
				})
			}

			return interactionReply({
				interaction,
				content: "Ce channel n'est pas en slowmode 😕",
				isSilent: isSilent,
			})
		}

		// On ajoute le cooldown
		// Erreur si le channel est déjà en slowmode
		if (interaction.channel.rateLimitPerUser > 0)
			return interactionReply({
				interaction,
				content: 'Ce channel est déjà en slowmode 😕',
				isSilent: isSilent,
			})

		await interaction.channel.setRateLimitPerUser(attente)

		// Si il n'y pas de temps du slowmode,
		// le slowmode reste jusqu'au prochain clear
		if (!duree)
			return interactionReply({
				interaction,
				content: `Channel en slowmode de ${convertSecondsToString(
					attente,
				)} pour une durée indéfinie 👌`,
			})

		// Sinon on donne le temps du slowmode
		await interactionReply({
			interaction,
			content: `Channel en slowmode de ${convertSecondsToString(
				attente,
			)} pendant ${convertSecondsToString(duree)} 👌`,
		})

		// on attend le montant défini
		await wait(attente * 1000)
		// Si le channel est encore en slowmode
		if (interaction.channel.rateLimitPerUser > 0) {
			// On le clear et on envoie un message de confirmation
			await interaction.channel.setRateLimitPerUser(0)
			return interactionReply({ interaction, content: 'Slowmode désactivé 👌' })
		}
	},
}
