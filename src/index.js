const Discord = require('discord.js')

const client = new Discord.Client()

client.login(process.env.TOKEN)

client.on('ready', () => console.log('ready'))

client.on('message', message => {
	console.log(message.content)
})
