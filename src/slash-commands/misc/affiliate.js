/* eslint-disable no-undefined */
import { SlashCommandBuilder } from '@discordjs/builders'
import fetch from 'node-fetch'

export default {
	data: new SlashCommandBuilder()
		.setName('affiliate')
		.setDescription('Crée un lien affilié')
		.addStringOption(option =>
			option.setName('lien').setDescription('Lien à affilier').setRequired(true),
		)
		.addBooleanOption(option =>
			option.setName('silent').setDescription('Exécuter la commande silencieusement'),
		),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		// Acquisition du lien à affilier et du silent
		const lien = interaction.options.getString('lien')
		const ephemeral = interaction.options.getBoolean('silent')

		// Acquisition de la clé API
		const API_key = client.config.affiliateApiKey

		// Vérification si l'utilisateur a bien un rôle staff
		const user = interaction.guild.members.cache.get(interaction.user.id)

		let permission = 0
		client.config.staffManagerRolesIDs.forEach(roleID => {
			if (user.roles.cache.has(roleID)) permission += 1
		})

		if (permission === 0)
			return interaction.reply({
				content: "Tu n'as pas la permission d'effectuer cette commande 😬",
			})

		// Requête
		const res = await fetch('https://api.ctrl-f.io/api/urls', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${API_key}`,
			},
			body: JSON.stringify({
				long_url: lien,
			}),
		})

		const { status_message, short_url = undefined } = await res.json()

		// S'il y a une erreur en retour ou pas d'url
		if (!res.ok || !short_url)
			return interaction.reply({ content: status_message, ephemeral: ephemeral })

		// Sinon on affiche l'url
		return interaction.reply({ content: `<${short_url}>`, ephemeral: ephemeral })
	},
}
