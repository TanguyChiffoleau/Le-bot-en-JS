module.exports = {
	name: 'ping',
	description: "Donne le ping de l'API ainsi que du bot",
	aliases: ['pong'],
	isEnabled: true,
	needArguments: false,
	guildOnly: false,
	execute: async (client, message) => {
		const sentMessage = await message.channel.send(`🏓 Pong`)
		const start = new Date()
		await sentMessage.edit(`🏓 Pong ?`)
		const editLatency = Math.round(new Date() - start)
		sentMessage.edit(
			`Modification d'un message: **${editLatency}** ms\nAPI: **${client.ws.ping}** ms`,
		)
	},
}
