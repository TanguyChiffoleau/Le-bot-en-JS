export default {
	name: 'coinflip',
	description: 'Coinflip! (pile ou face)',
	aliases: ['cf'],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: async (client, message) => {
		const random = Math.round(Math.random() * 100)

		let resultat = ''
		if (random < 50) resultat = 'Pile'
		else if (random > 50) resultat = 'Face'
		else resultat = 'Tranche'

		const sentMessage = await message.channel.send('La pièce tourne.')
		await sentMessage.edit('La pièce tourne..')
		return sentMessage.edit(`La pièce tourne... **${resultat}** !`)
	},
}
