const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

module.exports = {
	name: 'help',
	description: 'Affiche les commandes fixes du bot',
	aliases: ['aide'],
	isEnabled: true,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: (client, message, args) => {
		if (args.length === 0) {
			const fields = []
			client.commandsCategories.forEach((commandsNames, category) => {
				const allo = commandsNames.reduce((acc, commandName) => {
					const command = client.commands.get(commandName)
					return `${acc}- \`${commandName}\`: ${command.description}.\n`
				}, '')

				fields.push({
					name: capitalize(category),
					value: allo,
				})
			})

			return message.channel.send({
				embed: {
					title: 'Commandes principales disponibles',
					color: 'ff8000',
					fields,
				},
			})
		}

		const chosenCommand = args[0]
		const command = client.commands.get(chosenCommand)
		if (!command) return message.reply(`je n'ai pas trouvé la commande \`${chosenCommand}\` 😕`)

		const properties = [
			[
				'isEnabled',
				{
					true: 'La commande est activée',
					false: 'La commande est désactivée',
				},
			],
			[
				'needArguments',
				{
					true: 'La commande nécessite au moins un argument',
					false: "La commande ne nécessite pas d'argument",
				},
			],
			[
				'guildOnly',
				{
					true: 'La commande est active uniquement sur un serveur',
					false: 'La commande est active partout',
				},
			],
		]

		return message.channel.send({
			embed: {
				title: command.name,
				color: 'ff8000',
				description: command.description,
				fields: [
					{
						name: 'Propriétés',
						value: properties.reduce(
							(acc, [property, traduction]) =>
								`${acc}> ${
									command[property] ? traduction.true : traduction.false
								}\n`,
							'',
						),
					},
					{
						name: 'Aliases',
						value: command.aliases.reduce((acc, alias) => `${acc}> \`${alias}\`\n`, ''),
					},
					{
						name: 'Permissions nécessaires',
						value:
							command.requirePermissions.reduce(
								(acc, permission) => `${acc}> \`${permission}\`\n`,
								'',
							) || 'Ne nécessite aucune permission',
					},
				],
			},
		})
	},
}
