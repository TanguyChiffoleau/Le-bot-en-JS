module.exports = {
	name: 'coinflip',
	description: 'Coinflip! (pile ou face)',
	aliases: ['cf'],
	isEnabled: true,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: async (client, message) => {
		const random = Math.random()

		let resultat = ''
		if (random < 0.49) resultat = 'Pile'
		else if (random > 0.51) resultat = 'Face'
		else resultat = 'Tranche'

		const sentMessage = await message.channel.send('La pièce tourne.')
		await sentMessage.edit('La pièce tourne..')
		return sentMessage.edit(`La pièce tourne... **${resultat}** !`)
	},
}
