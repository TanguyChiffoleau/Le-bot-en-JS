/* eslint-disable consistent-return */
const { Collection } = require('discord.js')

module.exports = async (client, message) => {
	if (
		message.author.bot ||
		!message.content.startsWith(client.prefix) ||
		(message.channel.type === 'text' && message.guild.id !== process.env.GUILD_ID)
	)
		return

	const args = message.content.slice(client.prefix.length).split(/ +/)
	const commandName = args.shift().toLowerCase()
	const command =
		client.commands.get(commandName) ||
		client.commands.find(({ aliases }) => aliases && aliases.includes(commandName))

	if (!command) return

	// Partie cooldown
	if (!client.cooldowns.has(commandName)) client.cooldowns.set(command.name, new Collection())
	const now = Date.now()
	const timestamps = client.cooldowns.get(command.name)
	const cooldownAmount = (command.cooldown || 4) * 1000
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000
			return message.reply(
				`merci d'attendre ${timeLeft.toFixed(
					1,
				)} seconde(s) de plus avant de réutiliser la commande \`${command.name}\`.`,
			)
		}
	}
	timestamps.set(message.author.id, now)
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

	if (command.needArguments && !args.length)
		return message.reply("tu n'as pas donné d'argument(s) 😕")

	if (command.guildOnly && message.channel.type !== 'text')
		return message.reply('je ne peux pas exécuter cette commande dans les DMs 😮')

	try {
		message.channel.startTyping()
		await command.execute(client, message, args)
		message.channel.stopTyping(true)
	} catch (error) {
		message.channel.stopTyping(true)
		message.reply('il y a eu une erreur en exécutant la commande 😬')
	}
}
