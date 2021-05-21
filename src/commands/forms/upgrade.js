import { readFile } from 'fs/promises'
import { Constants } from 'discord.js'
import { isUserOnMobileDevice } from '../../util/util.js'

export default {
	name: 'upgrade',
	description: 'Donne le formulaire des upgrade',
	aliases: ['upgrades'],
	usage: {
		arguments: '[mention]',
		informations: null,
		examples: [
			{
				command: 'upgrade',
				explaination: "envoie le formulaire en DM à l'utilisateur et supprime son message",
			},
			{
				command: 'upgrade @Tanguy#3760',
				explaination:
					"envoie le formulaire en DM à l'utilisateur mentionné et donne l'état de la commande avec une réaction (✅ ou ❌)",
			},
		],
	},
	needArguments: false,
	guildOnly: true,
	requirePermissions: [],
	execute: async (client, message) => {
		const [upgrade, upgradeDescription] = await Promise.all([
			readFile('./forms/upgrade.md', { encoding: 'utf8' }),
			readFile('./forms/upgradeDescription.md', { encoding: 'utf8' }),
		])

		const embed = {
			color: '#C27C0E',
			title: 'Formulaire upgrade',
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
					value: upgradeDescription,
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
				await targetedMember.send(upgrade)
			} else {
				embed.description = upgrade
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
