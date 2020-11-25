const { convertSecondsToString } = require('../../util/util')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
	name: 'cooldown',
	description: 'Active le mode lent sur le channel',
	aliases: ['cd'],
	usage: {
		arguments: '[durée_du_cooldown] [valeur_du_cooldown]',
		informations:
			'Les valeurs sont en secondes. Valeurs par défaut : durée = 5x60, valeur = 30',
	},
	isEnabled: true,
	needArguments: false,
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

		// Valeurs par défaut :
		// slowModeValue = 30 secondes
		// slowModeTime = 5 minutes
		const [slowModeTime = 5 * 60, slowModeValue = 30] = args.map(arg => parseInt(arg, 10))

		if (message.channel.rateLimitPerUser > 0)
			return message.channel.send('Ce channel est déjà en slowmode 😕')

		await message.channel.setRateLimitPerUser(slowModeValue)
		message.channel.send(
			`Channel en slowmode de ${convertSecondsToString(
				slowModeValue,
			)} pendant ${convertSecondsToString(slowModeTime)} 👌`,
		)

		message.channel.stopTyping()
		await wait(slowModeTime * 1000)
		if (message.channel.rateLimitPerUser > 0) {
			await message.channel.setRateLimitPerUser(0)
			return message.channel.send('Slowmode désactivé 👌')
		}
	},
}
