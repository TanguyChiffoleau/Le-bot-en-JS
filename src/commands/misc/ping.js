module.exports = {
	name: 'ping',
	description: "Donne le ping de l'API ainsi que du bot (",
	aliases: ['pong'],
	isEnabled: true,
	needArguments: false,
	execute(client, message) {
		message.channel.send(`🏓 Pong`).then(async sentMessage => {
			const start = new Date()
			await sentMessage.edit(`🏓 Pong ?`)
			const editLatency = Math.round(new Date() - start)
			sentMessage.edit(
				`Modification d'un message: **${editLatency}** ms\nAPI: **${client.ws.ping}** ms`,
			)
		})
	},
}
