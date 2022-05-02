/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
import { SlashCommandBuilder } from '@discordjs/builders'
import { db } from '../../util/util.js'

export default {
	data: new SlashCommandBuilder()
		.setName('command')
		.setDescription('Gère les commandes')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Crée une nouvelle commande')
				.addStringOption(option =>
					option.setName('nom').setDescription('Nom de la commande').setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('contenu')
						.setDescription('Contenu de la commande')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Modifie une commande')
				.addStringOption(option =>
					option.setName('nom').setDescription('Nom de la commande').setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('contenu')
						.setDescription('Contenu de la commande')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Supprime une commande')
				.addStringOption(option =>
					option.setName('nom').setDescription('Nom de la commande').setRequired(true),
				),
		),
	interaction: async (interaction, client) => {
		const nom = interaction.options.getString('nom')
		const contenu = interaction.options.getString('contenu')

		const bdd = await db(client, 'userbot')

		if (!bdd)
			return interaction.reply({
				content: 'Une erreur est survenue lors de la connexion à la base de données 😕',
				ephemeral: true,
			})

		// Vérification si la commande existe
		const sqlCheckName = 'SELECT * FROM commands WHERE name = ?'
		const dataCheckName = [nom]
		const [rowsCheckName] = await bdd.execute(sqlCheckName, dataCheckName)

		switch (interaction.options.getSubcommand()) {
			// Nouvelle commande
			case 'create':
				if (rowsCheckName[0])
					return interaction.reply({
						content: `La commande **${nom}** existe déjà 😕`,
						ephemeral: true,
					})

				const sqlInsert =
					'INSERT INTO commands (name, content, author, createdAt, lastModification, lastModificationBy, numberOfUses) VALUES (?, ?, ?, ?, ?, ?, ?)'

				const dataInsert = [
					nom,
					contenu,
					interaction.user.id,
					Math.round(new Date() / 1000),
					Math.round(new Date() / 1000),
					interaction.user.id,
					0,
				]

				const [rowsInsert] = await bdd.execute(sqlInsert, dataInsert)

				if (rowsInsert.insertId)
					return interaction.reply({
						content: `La commande **${nom}** a bien été créée 👌`,
					})

				return interaction.reply({
					content: 'Une erreur est survenue lors de la création de la commande 😬',
					ephemeral: true,
				})

			// Modifie une commande
			case 'edit':
				if (!rowsCheckName[0])
					return interaction.reply({
						content: `La commande **${nom}** n'existe pas 😕`,
						ephemeral: true,
					})

				const sqlEdit =
					'UPDATE commands SET content = ?, lastModification = ?, lastModificationBy = ? WHERE name = ?'
				const dataEdit = [contenu, Math.round(new Date() / 1000), interaction.user.id, nom]

				const [rowsEdit] = await bdd.execute(sqlEdit, dataEdit)

				if (rowsEdit.changedRows)
					return interaction.reply({
						content: `La commande **${nom}** a bien été modifiée 👌`,
					})

				return interaction.reply({
					content: 'Une erreur est survenue lors de la modification de la commande 😬',
					ephemeral: true,
				})

			// Supprime une commande
			case 'delete':
				if (!rowsCheckName[0])
					return interaction.reply({
						content: `La commande **${nom}** n'existe pas 😕`,
						ephemeral: true,
					})

				const sqlDelete = 'DELETE FROM commands WHERE name = ?'
				const dataDelete = [nom]

				const [rowsDelete] = await bdd.execute(sqlDelete, dataDelete)

				if (rowsDelete.affectedRows)
					return interaction.reply({
						content: `La commande **${nom}** a bien été supprimée 👌`,
					})

				return interaction.reply({
					content: 'Une erreur est survenue lors de la suppression de la commande 😬',
					ephemeral: true,
				})
		}
	},
}
