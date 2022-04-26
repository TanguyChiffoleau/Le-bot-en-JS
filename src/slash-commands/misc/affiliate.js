import { SlashCommandBuilder } from '@discordjs/builders'
import mysql from 'mysql2/promise'
import fetch from 'node-fetch'

export default {
	data: new SlashCommandBuilder()
		.setName('affiliate')
		.setDescription('Crée un lien affilié')
		.addStringOption(option => option.setName('url').setDescription('URL longue')),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const long_url = interaction.options.getString('url')
		const bdd = await mysql.createConnection({
			host: client.config.dbHost,
			user: client.config.dbUser,
			password: client.config.dbPass,
			database: client.config.dbName,
		})

		const sql = `SELECT api_key FROM tokens WHERE discord_id = ?`
		const data = [interaction.user.id]
		const [rows] = await bdd.execute(sql, data)

		const api_key = rows[0].api_key

		// Requête
		const res = await fetch('https://api.ctrl-f.io/api/urls', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${api_key}`,
			},
			body: JSON.stringify({
				long_url: long_url,
			}),
		})

		// eslint-disable-next-line no-undefined
		const { status_message, short_url = undefined } = await res.json()

		// S'il y a une erreur en retour ou pas d'url
		if (!res.ok || !short_url)
			return interaction.reply({
				content: status_message,
				ephemeral: true,
			})

		// Sinon on affiche l'url
		return interaction.reply({
			content: `<${short_url}>`,
			ephemeral: true,
		})
	},
}
