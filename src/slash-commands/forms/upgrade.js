import { readFile } from 'fs/promises'
import { Constants } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder()
		.setName('upgrade')
		.setDescription('Donne le formulaire des upgrades')
		.addUserOption(option => option.setName('membre').setDescription('Membre')),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const [upgrade, upgradeDescription] = await Promise.all([
			readFile('./forms/upgrade.md', { encoding: 'utf8' }),
			readFile('./forms/upgradeDescription.md', { encoding: 'utf8' }),
		])

		// Acquisition du membre
		const user = interaction.options.getUser('membre') || interaction.user
		const member = interaction.guild.members.cache.get(user.id)
		if (!member)
			return interaction.reply({
				interaction,
				content: "je n'ai pas trouvé cet utilisateur, vérifiez la mention ou l'ID 😕",
			})

		const embed = {
			color: '#C27C0E',
			title: 'Formulaire upgrade',
			author: {
				name: interaction.guild.name,
				icon_url: interaction.guild.iconURL({ dynamic: true }),
				url: interaction.guild.vanityURL,
			},
			fields: [
				{
					name: 'Channel dans lequel renvoyer le formulaire complété',
					value: interaction.guild.channels.cache
						.get(client.config.upgradeChannelID)
						.toString(),
				},
				{
					name: 'Précisions',
					value: upgradeDescription,
				},
			],
		}

		try {
			await member.send({ embeds: [embed] })
			await member.send(upgrade)
		} catch (error) {
			if (error.code !== Constants.APIErrors.CANNOT_MESSAGE_USER) throw error

			if (member === interaction.user)
				interaction.reply({
					interaction,
					content:
						"je n'ai pas réussi à envoyer le message privé, tu as dû sûrement me bloquer / désactiver tes messages provenant du serveur 😬",
				})
			else
				interaction.reply({
					interaction,
					content:
						"je n'ai pas réussi à envoyer le DM, l'utilisateur mentionné m'a sûrement bloqué / désactivé les messages provenant du serveur 😬",
				})
		}

		if (member.user.id === interaction.user.id)
			return interaction.reply({
				interaction,
				content: 'formulaire envoyé en message privé 👌',
				ephemeral: true,
			})
		return interaction.reply({
			interaction,
			content: `formulaire envoyé en message privé à ${member} 👌`,
		})
	},
}
