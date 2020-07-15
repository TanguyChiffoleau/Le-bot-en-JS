const Discord = require('discord.js')
const { events: eventsLoader, commands: commandsLoader } = require('./util/loaders')

const client = new Discord.Client()
client.commands = new Discord.Collection()

client.prefix = '!'

client.login(process.env.TOKEN)

eventsLoader(client)

commandsLoader(client)
