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
	isEnabled: true,
	needArguments: false,
	guildOnly: true,
	requirePermissions: [],
	execute: (client, message, args) => {
		const embed = {
			color: '01579B',
			title: 'Rôles',
			description: '',
			footer: {
				text:
					'Seuls les grades affichés séparément et avec au moins un membre sont comptabilisés.',
			},
		}

		const roles = message.guild.roles.cache.filter(role => role.members.size > 0)

		const rolesHoist = roles.filter(role => role.hoist)

		embed.description = rolesHoist.reduce(
			(acc, role) => `${acc}${role} : ${pluralize('membre', role.members.size)}\n`,
			'',
		)

		if (args[0] === 'all') {
			const rolesWithoutHoist = roles
				.filter(role => !role.hoist)
				.sort((roleA, roleB) => roleB.members.size - roleA.members.size)

			embed.description += rolesWithoutHoist.reduce(
				(acc, role) => `${acc}${role} : ${pluralize('membre', role.members.size)}\n`,
				'\n',
			)
		}

		return message.channel.send({ embed })
	},
}
