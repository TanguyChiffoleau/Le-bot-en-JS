import { readFile } from 'fs/promises'
import { Constants } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Donne le formulaire des configs')
		.addUserOption(option => option.setName('membre').setDescription('Membre')),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const [config, configDescription] = await Promise.all([
			readFile('./forms/config.md', { encoding: 'utf8' }),
			readFile('./forms/configDescription.md', { encoding: 'utf8' }),
		])

		// Acquisition du membre
		const user = interaction.options.getUser('membre') || interaction.user
		const member = interaction.guild.members.cache.get(user.id)

		if (!member)
			return interaction.reply({
				content: "Je n'ai pas trouvé cet utilisateur, vérifie la mention ou l'ID 😕",
			})

		const embed = {
			color: '#C27C0E',
			title: 'Formulaire config',
			author: {
				name: interaction.guild.name,
				icon_url: interaction.guild.iconURL({ dynamic: true }),
				url: interaction.guild.vanityURL,
			},
			fields: [
				{
					name: 'Channel dans lequel renvoyer le formulaire complété',
					value: interaction.guild.channels.cache
						.get(client.config.configChannelID)
						.toString(),
				},
				{
					name: 'Précisions',
					value: configDescription,
				},
			],
		}

		try {
			await member.send({ embeds: [embed] })
			await member.send(config)
		} catch (error) {
			if (error.code === Constants.APIErrors.CANNOT_MESSAGE_USER)
				if (member.user === interaction.user)
					return interaction.reply({
						content:
							"Je n'ai pas réussi à envoyer le message privé, tu m'as sûrement bloqué / désactivé tes messages provenant du serveur 😬",
					})
				else
					return interaction.reply({
						content:
							"Je n'ai pas réussi à envoyer le DM, l'utilisateur mentionné m'a sûrement bloqué / désactivé les messages provenant du serveur 😬",
					})
		}

		if (member.user === interaction.user)
			return interaction.reply({
				content: 'Formulaire envoyé en message privé 👌',
				ephemeral: true,
			})
		return interaction.reply({
			content: `Formulaire envoyé en message privé à ${member} 👌`,
		})
	},
}
