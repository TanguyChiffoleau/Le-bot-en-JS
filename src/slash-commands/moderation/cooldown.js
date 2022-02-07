import { convertSecondsToString } from '../../util/util.js'
import { SlashCommandBuilder } from '@discordjs/builders'
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
	data: new SlashCommandBuilder()
		.setName('cooldown')
		.setDescription('Gère le mode lent sur le channel')
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Supprime le mode lent sur le channel')
				.addBooleanOption(option =>
					option.setName('silent').setDescription('Exécuter la commande silencieusement'),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Défini le mode lent sur le channel')
				.addIntegerOption(option =>
					option
						.setName('délai')
						.setDescription('Délai entre chaque message (en secondes)')
						.setRequired(true),
				)
				.addIntegerOption(option =>
					option.setName('durée').setDescription('Durée du slowmode (en secondes)'),
				)
				.addBooleanOption(option =>
					option.setName('silent').setDescription('Exécuter la commande silencieusement'),
				),
		),
	requirePermissions: ['MANAGE_MESSAGES'],
	interaction: async interaction => {
		const ephemeral = interaction.options.getBoolean('silent')
		if (interaction.options.getSubcommand() === 'set') {
			const delai = interaction.options.getInteger('délai')
			const duree = interaction.options.getInteger('durée')

			// On ajoute le cooldown
			// Erreur si le channel est déjà en slowmode
			if (interaction.channel.rateLimitPerUser > 0)
				return interaction.reply({
					content: 'Ce channel est déjà en slowmode 😕',
					ephemeral: ephemeral,
				})

			await interaction.channel.setRateLimitPerUser(delai)

			// Si il n'y pas de temps du slowmode,
			// le slowmode reste jusqu'au prochain clear
			if (!duree)
				return interaction.reply({
					content: `Channel en slowmode de ${convertSecondsToString(
						delai,
					)} pour une durée indéfinie 👌`,
					ephemeral: ephemeral,
				})

			// Sinon on donne le temps du slowmode
			await interaction.reply({
				content: `Channel en slowmode de ${convertSecondsToString(
					delai,
				)} pendant ${convertSecondsToString(duree)} 👌`,
			})

			// on attend le montant défini
			await wait(duree * 1000)
			// Si le channel est encore en slowmode
			if (interaction.channel.rateLimitPerUser > 0) {
				// On le clear et on envoie un message de confirmation
				await interaction.channel.setRateLimitPerUser(0)
				return interaction.followUp({
					content: 'Slowmode désactivé 👌',
					ephemeral: ephemeral,
				})
			}
		} else if (interaction.options.getSubcommand() === 'clear') {
			if (interaction.channel.rateLimitPerUser > 0) {
				await interaction.channel.setRateLimitPerUser(0)
				return interaction.reply({
					content: 'Slowmode désactivé 👌',
					ephemeral: ephemeral,
				})
			}

			return interaction.reply({
				content: "Ce channel n'est pas en slowmode 😕",
				ephemeral: ephemeral,
			})
		}
	},
}
