/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
import { SlashCommandBuilder } from '@discordjs/builders'
import { Constants } from 'discord.js'
import { readFile } from 'fs/promises'
import { db } from '../../util/util.js'

export default {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Gère les avertissements')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Crée un nouvel avertissement')
				.addUserOption(option =>
					option.setName('membre').setDescription('Membre').setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('raison')
						.setDescription("Raison de l'avertissement")
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('Voir les avertissements')
				.addUserOption(option =>
					option.setName('membre').setDescription('Membre').setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('del')
				.setDescription('Supprime un avertissement')
				.addStringOption(option =>
					option.setName('id').setDescription("ID de l'avertissement").setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Supprime tous les avertissements')
				.addUserOption(option =>
					option.setName('membre').setDescription('Membre').setRequired(true),
				),
		),
	interaction: async (interaction, client) => {
		let user = ''
		let member = ''

		if (interaction.options.getSubcommand() !== 'del') {
			// Acquisition du membre
			user = interaction.options.getUser('membre')
			member = interaction.guild.members.cache.get(user.id)
			if (!member)
				return interaction.reply({
					content: "Je n'ai pas trouvé cet utilisateur, vérifie la mention ou l'ID 😕",
					ephemeral: true,
				})
		}

		// Acquisition de la base de données
		const bdd = await db(client, 'userbot')
		if (!bdd)
			return interaction.reply({
				content: 'Une erreur est survenue lors de la connexion à la base de données 😕',
				ephemeral: true,
			})

		switch (interaction.options.getSubcommand()) {
			// Crée un nouvel avertissement
			case 'create':
				const reason = interaction.options.getString('raison')
				const sqlCreate =
					'INSERT INTO warnings (discordID, warnedBy, warnReason, warnedAt) VALUES (?, ?, ?, ?)'
				const dataCreate = [
					member.id,
					interaction.user.tag,
					reason,
					Math.round(Date.now() / 1000),
				]
				const [rowsCreate] = await bdd.execute(sqlCreate, dataCreate)

				if (!rowsCreate.insertId)
					return interaction.reply({
						content:
							"Une erreur est survenue lors de la création de l'avertissement 😬",
					})

				// Lecture du message d'avertissement
				const warnDM = await readFile('./forms/warn.md', { encoding: 'utf8' })

				// Envoi du message d'avertissement en message privé
				const DMMessage = await member
					.send({
						embeds: [
							{
								color: '#C27C0E',
								title: 'Avertissement',
								description: warnDM,
								author: {
									name: interaction.guild.name,
									icon_url: interaction.guild.iconURL({ dynamic: true }),
									url: interaction.guild.vanityURL,
								},
								fields: [
									{
										name: "Raison de l'avertissement",
										value: reason,
									},
								],
							},
						],
					})
					.catch(error => {
						if (error.code === Constants.APIErrors.CANNOT_MESSAGE_USER)
							return interaction.reply({
								content:
									"Je n'ai pas réussi à envoyer le DM, l'utilisateur mentionné m'a sûrement bloqué / désactivé les messages provenant du serveur 😬",
								ephemeral: true,
							})

						console.error(error)
						return interaction.reply({
							content: "Une erreur est survenue lors de l'envoi du message privé 😬",
							ephemeral: true,
						})
					})

				// Si au moins une erreur, throw
				if (DMMessage instanceof Error)
					throw new Error(
						"L'envoi d'un message a échoué. Voir les logs précédents pour plus d'informations.",
					)

				return interaction.reply({
					content: `⚠️ \`${member.user.tag}\` a reçu un avertissement`,
				})

			// Voir les avertissements
			case 'view':
				const sqlView = 'SELECT * FROM warnings WHERE discordID = ?'
				const dataView = [member.id]
				const [rowsView] = await bdd.execute(sqlView, dataView)

				if (!rowsView)
					return interaction.reply({
						content:
							'Une erreur est survenue lors de la récupération des avertissements 😬',
					})

				// Création de l'embed
				const embed = {
					color: '#C27C0E',
					description: `**Total : ${rowsView.length}**`,
					author: {
						name: `${member.displayName} (ID ${member.id})`,
						icon_url: member.user.displayAvatarURL({ dynamic: true }),
					},
					fields: [],
				}

				rowsView.forEach(warning => {
					embed.fields.push({
						name: `Avertissement #${warning.id}`,
						value: `Par ${warning.warnedBy} - <t:${warning.warnedAt}>\nRaison : ${warning.warnReason}`,
					})
				})

				return interaction.reply({ embeds: [embed] })

			// Supprime un avertissement
			case 'del':
				const id = interaction.options.getString('id')
				const sqlDelete = 'DELETE FROM warnings WHERE id = ?'
				const dataDelete = [id]
				const [rowsDelete] = await bdd.execute(sqlDelete, dataDelete)

				if (!rowsDelete.affectedRows)
					return interaction.reply({
						content:
							"Une erreur est survenue lors de la suppression de l'avertissement 😬",
					})

				return interaction.reply({
					content: "L'avertissement a bien été supprimé 👌",
				})

			// Supprime tous les avertissements
			case 'clear':
				const sqlDeleteAll = 'DELETE FROM warnings WHERE discordID = ?'
				const dataDeleteAll = [member.id]
				const [rowsDeleteAll] = await bdd.execute(sqlDeleteAll, dataDeleteAll)

				if (!rowsDeleteAll.affectedRows)
					return interaction.reply({
						content:
							'Une erreur est survenue lors de la suppression des avertissements 😬',
					})

				return interaction.reply({
					content: 'Les avertissements ont bien été supprimés 👌',
				})
		}
	},
}
