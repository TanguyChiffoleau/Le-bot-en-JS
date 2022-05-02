/* eslint-disable no-mixed-operators */
import { SlashCommandBuilder } from '@discordjs/builders'
import { db, convertDateForDiscord } from '../../util/util.js'
import ms from 'ms'

export default {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Défini un rappel')
		.addStringOption(option =>
			option.setName('temps').setDescription('Temps avant le rappel').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('rappel').setDescription('Rappel').setRequired(true),
		),
	interaction: async (interaction, client) => {
		const temps = interaction.options.getString('temps')
		const rappel = interaction.options.getString('rappel')

		// Acquisition de la base de données
		const bdd = await db(client, 'userbot')
		if (!bdd)
			return interaction.reply({
				content: 'Une erreur est survenue lors de la connexion à la base de données 😕',
				ephemeral: true,
			})

		// Insertion du rappel en base de données
		const timestampStart = Math.round(Date.now() / 1000)
		const timestampEnd = Math.round(Date.now() / 1000) + ms(temps) / 1000

		try {
			const sql = 'INSERT INTO reminders (discordID, reminder, timestampEnd) VALUES (?, ?, ?)'
			const data = [interaction.user.id, rappel, timestampEnd]
			const [resultInsert] = await bdd.execute(sql, data)

			if (!resultInsert.insertId)
				return interaction.reply({
					content:
						'Une erreur est survenue lors de la création du rappel en base de données 😬',
					ephemeral: true,
				})
		} catch (error) {
			return interaction.reply({
				content:
					'Une erreur est survenue lors de la création du rappel en base de données 😬',
				ephemeral: true,
			})
		}

		setTimeout(async () => {
			try {
				const sqlDelete = 'DELETE FROM reminders WHERE timestampEnd = ?'
				const dataDelete = [timestampEnd]
				const [resultDelete] = await bdd.execute(sqlDelete, dataDelete)

				const member = interaction.guild.members.cache.get(interaction.user.id)

				if (!resultDelete)
					return member.send({
						content:
							'Une erreur est survenue lors de la suppression du rappel en base de données 😬',
					})

				return member.send({
					content: `Rappel : ${rappel}`,
				})
			} catch {
				return interaction.reply({
					content:
						'Une erreur est survenue lors de la suppression du rappel en base de données 😬',
					ephemeral: true,
				})
			}
		}, (timestampEnd - timestampStart) * 1000)

		return interaction.reply({
			content: `Rappel créé 👌\nRappel : ${rappel}\nProgrammé le ${convertDateForDiscord(
				timestampEnd * 1000,
			)}`,
			ephemeral: true,
		})
	},
}
