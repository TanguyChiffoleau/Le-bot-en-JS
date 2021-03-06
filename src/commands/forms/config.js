import { readFile } from 'fs/promises'
import { Constants } from 'discord.js'
import { isUserOnMobileDevice } from '../../util/util.js'

export default {
	name: 'config',
	description: 'Donne le formulaire des configs',
	aliases: ['configs'],
	usage: {
		arguments: '[mention]',
		informations: null,
		examples: [
			{
				command: 'config',
				explaination: "envoie le formulaire en DM à l'utilisateur et supprime son message",
			},
			{
				command: 'config @Tanguy#3760',
				explaination:
					"envoie le formulaire en DM à l'utilisateur mentionné et donne l'état de la commande avec une réaction (✅ ou ❌)",
			},
		],
	},
	needArguments: false,
	guildOnly: true,
	requirePermissions: [],
	execute: async (client, message) => {
		const [config, configDescription] = await Promise.all([
			readFile('./forms/config.md', { encoding: 'utf8' }),
			readFile('./forms/configDescription.md', { encoding: 'utf8' }),
		])

		const embed = {
			color: '#C27C0E',
			title: 'Formulaire config',
			author: {
				name: message.guild.name,
				icon_url: message.guild.iconURL({ dynamic: true }),
				url: message.guild.vanityURL,
			},
			fields: [
				{
					name: 'Channel dans lequel renvoyer le formulaire complété',
					value: message.guild.channels.cache.get(client.config.configChannelID),
				},
				{
					name: 'Précisions',
					value: configDescription,
				},
			],
		}

		const targetedMember =
			!message.mentions.members || !message.mentions.members.size
				? message.member
				: message.mentions.members.first()

		const targetedMemberStatus = targetedMember.user.presence.clientStatus

		try {
			if (isUserOnMobileDevice(targetedMemberStatus)) {
				await targetedMember.send({ embed })
				await targetedMember.send(config)
			} else {
				embed.description = config
				await targetedMember.send({ embed })
			}
		} catch (error) {
			if (error.code !== Constants.APIErrors.CANNOT_MESSAGE_USER) throw error

			if (targetedMember === message.member)
				message.reply(
					"je n'ai pas réussi à envoyer le message privé, tu as dû sûrement me bloquer/désactiver tes messages provenant du serveur 😬",
				)
			else
				message.reply(
					"je n'ai pas réussi à envoyer le DM, l'utilisateur mentionné m'a sûrement bloqué /désactivé les messages provenant du serveur 😬",
				)

			return message.react('❌')
		}

		if (targetedMember === message.member) return message.delete()

		return message.react('✅')
	},
}
