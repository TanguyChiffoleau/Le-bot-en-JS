import { interactionReply } from '../../util/util.js'
const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

export default {
	name: 'help',
	description: 'Affiche les commandes fixes du bot',
	options: [
		{
			type: 'input',
			name: 'commande',
			optDesc: "Nom de la commande où l'on veut des détails",
		},
	],
	requirePermissions: [],
	interaction: (interaction, client) => {
		// Si aucun argument, on montre la liste des commandes principales
		const commandeName = interaction.options.getString('commande')
		if (!commandeName) {
			const fields = []
			client.commandsCategories.forEach((commandsNames, category) => {
				const commandsDescription = commandsNames.reduce((acc, commandName) => {
					const command = client.commands.get(commandName)
					return `${acc}- \`${commandName}\` : ${command.description}.\n`
				}, '')

				fields.push({
					name: capitalize(category),
					value: commandsDescription,
				})
			})

			return interactionReply({
				interaction,
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
			return interactionReply({
				interaction,
				content: `je n'ai pas trouvé la commande \`${commandeName}\` 😕`,
			})

		const options = Object.entries(command.options[0])
		const fields = []

		let optionsDescription = ''
		for (const [optionKey, optionValue] of options)
			optionsDescription += `- \`${optionKey}\` : ${optionValue}\n`

		fields.push(
			{
				name: 'Options',
				value: optionsDescription,
			},
			{
				name: 'Permissions nécessaires',
				value:
					command.requirePermissions.reduce(
						(acc, permission) => `${acc}> \`${permission}\`\n`,
						'',
					) || 'Ne nécessite aucune permission',
			},
		)

		// Création de l'embed avec les options
		const embed = {
			title: command.name,
			color: 'ff8000',
			description: command.description,
			fields,
		}

		return interactionReply({ interaction, embeds: [embed] })
	},
}
