/* eslint-disable no-continue */
const { Collection } = require('discord.js')
const { convertDate } = require('../../util/util')

module.exports = async (client, message) => {
	if (
		message.author.bot ||
		(message.guild && (message.guild.id !== client.config.guildID || !message.guild.available))
	)
		return

	if (message.content.startsWith(client.config.prefix)) {
		const args = message.content.slice(client.config.prefix.length).split(/ +/)
		const commandName = args.shift().toLowerCase()
		const command =
			client.commands.get(commandName) ||
			client.commands.find(({ aliases }) => aliases.includes(commandName))

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

		if (command.guildOnly && !message.guild)
			return message.reply(
				'Je ne peux pas exécuter cette commande dans les messages privés 😕',
			)

		if (
			command.requirePermissions.length > 0 &&
			!message.member.permissionsIn(message.channel).has(command.requirePermissions)
		)
			return message.reply("tu n'as pas les permissions d'effectuer cette commande 😕")

		try {
			message.channel.startTyping()
			await command.execute(client, message, args)
			return message.channel.stopTyping(true)
		} catch (error) {
			message.channel.stopTyping(true)
			message.reply('il y a eu une erreur en exécutant la commande 😬')
			console.error(error)
		}
	} else {
		// Partie citation
		const splitted = message.content.split('\n');
		const contentsSplitted = [];
		for (splitContent of splitted) {
			const regex = /https:\/\/(canary\.)?discord(app)?\.com\/channels\/(\d{16,18})\/(\d{16,18})\/(\d{16,18})/g;
			if (!splitContent.match(regex))
				continue;

			const matches = regex.exec(splitContent.match(regex));
			contentsSplitted.push({
				citation: splitContent.startsWith('> ') ? true : false,
				content: splitContent,
				link: splitContent.match(regex) ? {
					guildId: matches[3],
					channelId: matches[4],
					messageId: matches[5]
				} : false
			});
		}

		for ({ citation, content, link } of contentsSplitted) {
			const { guildId, channelId, messageId } = link;

			if (citation) continue;
			if (!link) continue;

			if (guildId !== client.config.guildID) continue;

			const foundChannel = message.guild.channels.cache.find(channel => channel.id === channelId);
			if (!foundChannel) continue;

			const foundMessage = await foundChannel.messages.fetch(messageId);
			if (!foundMessage || (!foundMessage.cleanContent && !foundMessage.attachments.size)) continue;

			const messageEmbed = {
				author: { name: 'Citation', icon_url: foundMessage.author.displayAvatarURL({ dynamic: true }) },
				description: foundMessage.cleanContent,
				fields: [{
					name: 'Auteur',
					value: foundMessage.member,
					inline: true,
				}, {
					name: 'Channel',
					value: foundMessage.channel,
					inline: true,
				}, {
					name: 'Message',
					value: `[Aller au message](${foundMessage.url})`,
					inline: true
				}
				],
				footer: { text: `Date: ${convertDate(foundMessage.createdAt)}` }
			}

			if (foundMessage.editedAt)
				messageEmbed.footer.text += ` (Dernier edit: ${convertDate(foundMessage.editedAt)})`;

			if (message.author !== foundMessage.author) {
				messageEmbed.footer.icon_url = message.author.displayAvatarURL({ dynamic: true });
				messageEmbed.footer.text += `\nCité par ${message.author.tag} (ID ${message.author.id}) le ${convertDate(message.createdAt)}`;
			}

			const attachments = foundMessage.attachments;
			if (attachments.size) {
				if (attachments.size === 1) {
					const file = attachments.first();
					const format = file.name.split('.').pop().toLowerCase();
					if (format.match(/png|jpeg|jpg|gif|webp/))
						messageEmbed.image = { url: file.url };
					else
						messageEmbed.fields.push({ name: file.filename, value: file.url, inline: true });
				} else {
					messageEmbed.fields.push({ name: '\u200b', value: '\u200b', inline: true });
					attachments.forEach(attachement => messageEmbed.fields.push({ name: attachement.name, value: attachement.url, inline: true }));
				}
			}
			message.channel.send({ embed: messageEmbed });
		}
	}
}
