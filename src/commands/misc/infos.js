import { diffDate } from '../../util/util.js'

// import nodePackage from '../../../package.json'
import { readFileSync } from 'fs'
const { version } = JSON.parse(readFileSync('./package.json'))

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
						value: version,
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
