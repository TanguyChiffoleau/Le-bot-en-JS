/* eslint-disable consistent-return */

module.exports = async (client, message) => {
	if (message.guild && message.guild.id !== process.env.GUILD_ID) return

	if (message.author.bot || !message.content.startsWith(client.prefix)) return

	const args = message.content.slice(client.prefix.length).split(/ +/)
	const commandName = args.shift().toLowerCase()

	const command =
		client.commands.get(commandName) ||
		client.commands.find(({ aliases }) => aliases && aliases.includes(commandName))

	if (!command) return

	if (command.needArguments && !args.length)
		return message.reply("tu n'as pas donné d'argument(s) 😕")

	try {
		message.channel.startTyping()
		await command.execute(client, message, args)
		message.channel.stopTyping(true)
	} catch (error) {
		message.channel.stopTyping(true)
		message.reply('il y a eu une erreur en exécutant la commande 😬')
	}
}
