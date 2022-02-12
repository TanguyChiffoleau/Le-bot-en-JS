/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
import { convertSecondsToString } from '../../util/util.js'
import { SlashCommandBuilder } from '@discordjs/builders'
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
	data: new SlashCommandBuilder()
		.setName('cooldown')
		.setDescription('Gère le mode lent sur le salon')
		.addSubcommand(subcommand =>
			subcommand.setName('clear').setDescription('Supprime le mode lent sur le salon'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Défini le mode lent sur le salon')
				.addIntegerOption(option =>
					option
						.setName('délai')
						.setDescription('Délai entre chaque message (en secondes)')
						.setRequired(true),
				)
				.addIntegerOption(option =>
					option.setName('durée').setDescription('Durée du slowmode (en secondes)'),
				),
		),
	requirePermissions: ['MANAGE_MESSAGES'],
	interaction: async interaction => {
		switch (interaction.options.getSubcommand()) {
			// Ajout d'un cooldown
			case 'set':
				const delai = interaction.options.getInteger('délai')
				const duree = interaction.options.getInteger('durée')

				// On ajoute le cooldown
				// Erreur si le salon est déjà en slowmode
				if (interaction.channel.rateLimitPerUser > 0)
					return interaction.reply({
						content: 'Ce salon est déjà en slowmode 😕',
						ephemeral: true,
					})

				await interaction.channel.setRateLimitPerUser(delai)

				// S'iil n'y pas de temps du slowmode,
				// le slowmode reste jusqu'au prochain clear
				if (!duree)
					return interaction.reply({
						content: `Slowmode activé 👌\nDélai entre chaque message : ${convertSecondsToString(
							delai,
						)}\nDurée : indéfinie`,
					})

				// Sinon on donne le temps du slowmode
				await interaction.reply({
					content: `Slowmode activé 👌\nDélai entre chaque message : ${convertSecondsToString(
						delai,
					)}\nDurée : ${convertSecondsToString(duree)}`,
				})

				// On attend le montant défini
				await wait(duree * 1000)

				// Si le salon est encore en slowmode
				if (interaction.channel.rateLimitPerUser > 0) {
					// On le clear et on envoie un message de confirmation
					await interaction.channel.setRateLimitPerUser(0)
					return interaction.channel.send({
						content: 'Slowmode désactivé 👌',
					})
				}

				return

			// Suppression du cooldown
			case 'clear':
				if (interaction.channel.rateLimitPerUser > 0) {
					await interaction.channel.setRateLimitPerUser(0)
					return interaction.reply({
						content: 'Slowmode désactivé 👌',
					})
				}

				return interaction.reply({
					content: "Ce salon n'est pas en slowmode 😕",
					ephemeral: true,
				})
		}
	},
}
