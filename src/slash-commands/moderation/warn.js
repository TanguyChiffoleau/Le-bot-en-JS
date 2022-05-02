/* eslint-disable default-case */
import { SlashCommandBuilder } from '@discordjs/builders'
import { Constants } from 'discord.js'
import { readFile } from 'fs/promises'
import { db, convertDateForDiscord } from '../../util/util.js'
import { Pagination } from 'pagination.djs'

export default {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Gère les avertissements')
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

		// Afin d'éviter les erreurs, on récupère le membre
		// pour toutes les commandes sauf "del"
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
			// Voir les avertissements
			case 'view':
				try {
					const sqlView = 'SELECT * FROM warnings WHERE discordID = ?'
					const dataView = [member.id]
					const [resultView] = await bdd.execute(sqlView, dataView)

					// Si erreur
					if (!resultView)
						return interaction.reply({
							content:
								'Une erreur est survenue lors de la récupération des avertissements 😬',
						})

					// Sinon, boucle d'ajout des champs
					const fieldsEmbed = []
					resultView.forEach(warning => {
						fieldsEmbed.push({
							name: `Avertissement #${warning.id}`,
							value: `Par ${warning.warnedBy} - ${convertDateForDiscord(
								warning.warnedAt * 1000,
							)}\nRaison : ${warning.warnReason}`,
						})
					})

					// Configuration de l'embed
					const pagination = new Pagination(interaction, {
						firstEmoji: '⏮',
						prevEmoji: '◀️',
						nextEmoji: '▶️',
						lastEmoji: '⏭',
						limit: 5,
						idle: 30000,
						ephemeral: false,
						prevDescription: '',
						postDescription: '',
						buttonStyle: 'SECONDARY',
						loop: false,
					})

					pagination.author = {
						name: `${member.displayName} (ID ${member.id})`,
						icon_url: member.user.displayAvatarURL({ dynamic: true }),
					}

					pagination.setDescription(`**Total : ${resultView.length}**`)
					pagination.setColor('#C27C0E')
					pagination.setFields(fieldsEmbed)
					pagination.footer = { text: 'Page : {pageNumber} / {totalPages}' }
					pagination.paginateFields(true)

					// Envoi de l'embed
					return pagination.render()
				} catch {
					return interaction.reply({
						content:
							'Une erreur est survenue lors de la récupération des avertissements 😬',
					})
				}

			// Crée un nouvel avertissement
			case 'create':
				try {
					// Acquisition de la raison
					// puis insertion en base de données
					const reason = interaction.options.getString('raison')
					const sqlCreate =
						'INSERT INTO warnings (discordID, warnedBy, warnReason, warnedAt) VALUES (?, ?, ?, ?)'
					const dataCreate = [
						member.id,
						interaction.user.tag,
						reason,
						Math.round(Date.now() / 1000),
					]
					const [resultCreate] = await bdd.execute(sqlCreate, dataCreate)

					// Si erreur
					if (!resultCreate.insertId)
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
								content:
									"Une erreur est survenue lors de la création de l'avertissement 😬",
								ephemeral: true,
							})
						})

					// Si au moins une erreur, throw
					if (DMMessage instanceof Error)
						throw new Error(
							"L'envoi d'un message a échoué. Voir les logs précédents pour plus d'informations.",
						)

					// Message de confirmation
					return interaction.reply({
						content: `⚠️ \`${member.user.tag}\` a reçu un avertissement`,
					})
				} catch {
					return interaction.reply({
						content:
							'Une erreur est survenue lors de la récupération des avertissements 😬',
					})
				}

			// Supprime un avertissement
			case 'del':
				try {
					// Acquisition de l'id de la commande
					// puis suppresion en base de données
					const id = interaction.options.getString('id')
					const sqlDelete = 'DELETE FROM warnings WHERE id = ?'
					const dataDelete = [id]
					const [resultDelete] = await bdd.execute(sqlDelete, dataDelete)

					// Si erreur
					if (!resultDelete.affectedRows)
						return interaction.reply({
							content:
								"Une erreur est survenue lors de la suppression de l'avertissement 😬",
						})

					// Sinon, message de confirmation
					return interaction.reply({
						content: "L'avertissement a bien été supprimé 👌",
					})
				} catch {
					return interaction.reply({
						content:
							"Une erreur est survenue lors de la suppression de l'avertissement 😬",
					})
				}

			// Supprime tous les avertissements
			case 'clear':
				try {
					// Suppression en base de données
					const sqlDeleteAll = 'DELETE FROM warnings WHERE discordID = ?'
					const dataDeleteAll = [member.id]
					const [resultDeleteAll] = await bdd.execute(sqlDeleteAll, dataDeleteAll)

					// Si erreur
					if (!resultDeleteAll.affectedRows)
						return interaction.reply({
							content:
								'Une erreur est survenue lors de la suppression des avertissements 😬',
						})

					// Sinon, message de confirmation
					return interaction.reply({
						content: 'Les avertissements ont bien été supprimés 👌',
					})
				} catch {
					return interaction.reply({
						content:
							'Une erreur est survenue lors de la suppression des avertissements 😬',
					})
				}
		}
	},
}
