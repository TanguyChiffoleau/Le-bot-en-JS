const { pluralize } = require('../../util/util')

module.exports = {
	name: 'roles',
	description: 'Affiche le nombre de membres pour chaque rôle',
	aliases: ['rôles', 'rôle', 'role'],
	usage: {
		arguments: '[all]',
		informations: `"all" correspond à l'affichage de tous les rôles, même ceux qui n'apparaissent pas à droite`,
		exemples: [
			{
				command: 'roles',
				explaination: 'affiche les rôles qui apparaissent séparément à droite',
			},
			{
				command: 'roles all',
				explaination: "affiche tous les rôles, même ceux qui n'apparaissent pas à droite",
			},
		],
	},
	needArguments: false,
	guildOnly: true,
	requirePermissions: [],
	execute: (client, message, args) => {
		// Création de l'embed
		const embed = {
			color: '01579B',
			title: 'Rôles',
			description: '',
			footer: {
				text:
					'Seuls les grades affichés séparément et avec au moins un membre sont comptabilisés.',
			},
		}

		// Acquisition des roles ayant au moins un membre et sépartion
		// des rôles en fonction de leur apparition séparement à droite
		const [rolesHoist, rolesWithoutHoist] = message.guild.roles.cache
			.filter(role => role.members.size > 0)
			.partition(role => role.hoist)

		// Ajout à la description des rôles apparaissant séparement à droite
		embed.description = rolesHoist
			.sort((roleA, roleB) => roleB.position - roleA.position)
			.reduce(
				(acc, role) => `${acc}${role} : ${pluralize('membre', role.members.size)}\n`,
				'',
			)

		// Si l'argument "all" est passé, on montre
		// également les rôles qui n'apparaissent pas séparement
		if (args[0] === 'all')
			// Tri par nombre d'utilisateur puis ajout à la description
			embed.description += rolesWithoutHoist
				.sort((roleA, roleB) => roleB.members.size - roleA.members.size)
				.reduce(
					(acc, role) => `${acc}${role} : ${pluralize('membre', role.members.size)}\n`,
					'\n',
				)

		return message.channel.send({ embed })
	},
}
