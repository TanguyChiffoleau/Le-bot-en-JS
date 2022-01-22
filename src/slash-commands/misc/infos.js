import { diffDate } from '../../util/util.js'
import { SlashCommandBuilder } from '@discordjs/builders'

// import nodePackage from '../../../package.json'
import { readFileSync } from 'fs'
const { version } = JSON.parse(readFileSync('./package.json'))

export default {
	data: new SlashCommandBuilder()
		.setName('infos')
		.setDescription('Donne quelques infos et le statut du bot'),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const embed = {
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
					name: 'Version',
					value: version,
					inline: true,
				},
				{
					name: 'Code source',
					value: `[GitHub](https://github.com/TanguyChiffoleau/Le-bot-en-JS)`,
					inline: true,
				},
			],
		}

		await interaction.reply({ interaction, embeds: [embed] })
	},
}
