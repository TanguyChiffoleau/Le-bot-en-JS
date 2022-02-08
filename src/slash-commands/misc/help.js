import { SlashCommandBuilder } from '@discordjs/builders'
const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

export default {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Affiche les commandes fixes du bot')
		.addStringOption(option =>
			option
				.setName('commande')
				.setDescription("Nom de la commande où l'on veut des détails"),
		),
	requirePermissions: [],
	interaction: (interaction, client) => {
		// Si aucun argument, on montre la liste des commandes principales
		const commandeName = interaction.options.getString('commande')
		if (!commandeName) {
			const fields = []
			client.commandsCategories.forEach((commandsNames, category) => {
				const commandsDescription = commandsNames.reduce((acc, commandName) => {
					const command = client.commands.get(commandName)
					return `${acc}- \`${commandName}\` : ${command.data.description}.\n`
				}, '')

				fields.push({
					name: capitalize(category),
					value: commandsDescription,
				})
			})

			return interaction.reply({
				embeds: [
					{
						title: 'Commandes principales disponibles',
						color: 'ff8000',
						fields,
					},
				],
			})
		}

		// Acquisition de la commande
		const command = client.commands.get(commandeName)
		if (!command)
			return interaction.reply({
				content: `Je n'ai pas trouvé la commande \`${commandeName}\` 😕`,
				ephemeral: true,
			})

		// Création de l'embed avec les options
		const embed = {
			title: command.data.name,
			color: 'ff8000',
			description: command.data.description,
			fields: [
				{
					name: 'Permissions nécessaires',
					value:
						command.requirePermissions.reduce(
							(acc, permission) => `${acc}> \`${permission}\`\n`,
							'',
						) || 'Ne nécessite aucune permission',
				},
			],
		}

		return interaction.reply({ embeds: [embed] })
	},
}
