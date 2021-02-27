import package from '../../../package.json'
import { diffDate } from '../../util/util.js'

export default {
	name: 'infos',
	description: 'Donne quelques infos sur le bot',
	aliases: ['info'],
	usage: null,
	needArguments: false,
	guildOnly: false,
	requirePermissions: [],
	execute: (client, message) =>
		message.channel.send({
			embed: {
				color: '01579B',
				title: 'Infos',
				fields: [
					{
						name: 'Latence API',
						value: `${client.ws.ping} ms`,
						inline: true,
					},
					{
						name: 'Uptime',
						value: diffDate(client.readyAt),
						inline: true,
					},
					{
						name: 'Prefix',
						value: `\`${client.config.prefix}\``,
						inline: true,
					},
					{
						name: 'version',
						value: package.version,
						inline: true,
					},
					{
						name: 'Source Code',
						value: `[GitHub](https://github.com/TanguyChiffoleau/Le-bot-en-JS)`,
						inline: true,
					},
					{
						name: '\u200b',
						value: '\u200b',
						inline: true,
					},
				],
			},
		}),
}
