import { Util } from 'discord.js'
import { pluralizeWithoutQuantity } from '../../util/util.js'
const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

export default {
	name: 'help',
	description: 'Affiche les commandes fixes du bot',
	aliases: ['aide'],
	usage: {
		arguments: '[commande]',
		informations: null,
	},
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: (client, message, args) => {
		// Si aucun argument, on montre la liste des commandes principales
		if (args.length === 0) {
			const fields = []
			client.commandsCategories.forEach((commandsNames, category) => {
				const commandsDescription = commandsNames.reduce((acc, commandName) => {
					const command = client.commands.get(commandName)
					return `${acc}- \`${commandName}\`: ${command.description}.\n`
				}, '')

				fields.push({
					name: capitalize(category),
					value: commandsDescription,
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

		// Acquisition de la commande
		const chosenCommand = args[0]
		const command =
			client.commands.get(chosenCommand) ||
			client.commands.find(({ aliases }) => aliases.includes(chosenCommand))
		if (!command) return message.reply(`je n'ai pas trouvé la commande \`${chosenCommand}\` 😕`)

		// Fait l'intérmédiaire entre la propriété et sa traduction en langage
		const properties = [
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

		// Création de l'embed avec les propriétés toujours présentes
		const embed = {
			title: command.name,
			color: 'ff8000',
			description: command.description,
			fields: [
				{
					name: 'Propriétés',
					value: properties.reduce(
						(acc, [property, traduction]) =>
							`${acc}> ${traduction[command[property]]}\n`,
						'',
					),
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
		}

		// Ajout des aliases
		if (command.aliases.length > 0)
			embed.fields.push({
				name: 'Aliases',
				value: command.aliases.reduce((acc, alias) => `${acc}> \`${alias}\`\n`, ''),
			})

		// Ajout de l'usage pour la commande
		if (command.usage) {
			embed.fields.push({
				name: 'Utilisation',
				value: `${command.name} ${Util.escapeMarkdown(command.usage.arguments)}${
					command.usage.informations ? `\n_(${command.usage.informations})_` : ''
				}\n\nObligatoire: \`<>\` | Optionnel: \`[]\` | "ou": \`|\``,
			})

			// Ajout des exemples
			if (command.usage.examples.length > 0)
				embed.fields.push({
					name: pluralizeWithoutQuantity('Exemple', command.usage.examples.length),
					value: command.usage.examples.reduce(
						(acc, exemple) =>
							`${acc}> \`${exemple.command}\` ${
								exemple.explaination ? `⟶ ${exemple.explaination}` : ''
							}\n`,
						'',
					),
				})
		}

		return message.channel.send({ embed })
	},
}
