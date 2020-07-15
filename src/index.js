const Discord = require('discord.js')
const { events: eventsLoader, commands: commandsLoader } = require('./util/loaders')

if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: './config/bot.env' })

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.prefix = '!'

client.login(process.env.DISCORD_TOKEN)

eventsLoader(client)

commandsLoader(client)
