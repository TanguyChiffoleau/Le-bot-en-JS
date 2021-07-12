import { convertSecondsToString } from '../../util/util.js'
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
	name: 'cooldown',
	description: 'Active le mode lent sur le channel',
	aliases: ['cd'],
	usage: {
		arguments: '[clear] | [durée_du_cooldown] [valeur_du_cooldown]',
		informations:
			'Les valeurs sont en secondes. Valeurs par défaut : durée = 5x60, valeur = 30',
		examples: [
			{
				command: 'cooldown clear',
				explaination: 'supprime le cooldown du channel',
			},
			{
				command: 'cooldown 20',
				explaination: 'cooldown de 20 secondes pendant une durée indéfinie',
			},
			{
				command: 'cooldown 20 50',
				explaination: 'cooldown de 20 secondes pendant 50 secondes',
			},
		],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: ['MANAGE_MESSAGES'],
	execute: async (client, message, args) => {
		// Supprime le cooldown avec l'argument "clear"
		if (args[0] === 'clear') {
			if (message.channel.rateLimitPerUser > 0) {
				await message.channel.setRateLimitPerUser(0)
				return message.channel.send('Slowmode désactivé 👌')
			}

			return message.channel.send("Ce channel n'est pas en slowmode 😕")
		}

		// On ajoute le cooldown
		// Erreur si le channel est déjà en slowmode
		if (message.channel.rateLimitPerUser > 0)
			return message.channel.send('Ce channel est déjà en slowmode 😕')

		const [slowModeValue, slowModeTime] = args.map(arg => parseInt(arg, 10))

		await message.channel.setRateLimitPerUser(slowModeValue)

		// Si il n'y pas de temps du slowmode,
		// le slowmode reste jusqu'au prochain clear
		if (!slowModeTime)
			return message.channel.send(
				`Channel en slowmode de ${convertSecondsToString(
					slowModeValue,
				)} pour une durée indéfinie 👌`,
			)

		// Sinon on donne le temps du slowmode
		message.channel.send(
			`Channel en slowmode de ${convertSecondsToString(
				slowModeValue,
			)} pendant ${convertSecondsToString(slowModeTime)} 👌`,
		)

		// On arrête d'écrir dans le channel
		message.channel.stopTyping()
		// Et on attend le montant défini
		await wait(slowModeTime * 1000)
		// Si le channel est encore en slowmode
		if (message.channel.rateLimitPerUser > 0) {
			// On le clear et on envoie un message de confirmation
			await message.channel.setRateLimitPerUser(0)
			return message.channel.send('Slowmode désactivé 👌')
		}
	},
}
