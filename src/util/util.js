/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import {
	GuildMember,
	Client,
	User,
	MessageEmbed,
	MessageButton,
	MessageSelectMenu,
	Interaction,
	MessageAttachment,
} from 'discord.js'

/**
 * Gère l'ajout de "s" à la fin d'un mot en fonction de la quantité
 * @param {string} word mot
 * @param {number} quantity quantité
 * @param {boolean} isAlwaysPlural si le mot est toujours au pluriel ou non
 * @returns un string vide si la quantité est nulle, sinon le mot avec la quantité
 * @example pluralize(année, 4) => '4 années'
 * 			pluralize(année, 1) => '1 année'
 * 			pluralize(pomme, 0) => ''
 * 			pluralize(mois, 4, true) => '4 mois'
 */
export const pluralize = (word, quantity, isAlwaysPlural = false) => {
	if (quantity === 0) return ''
	else if (isAlwaysPlural) return `${quantity} ${word}`
	return `${quantity} ${word}${quantity > 1 ? 's' : ''}`
}

/**
 * Gère l'ajout de "s" à la fin d'un mot en fonction de la quantité
 * @param {string} word mot
 * @param {number} quantity quantité
 * @param {boolean} isAlwaysPlural si le mot est toujours au pluriel ou non
 * @returns un string vide si la quantité est nulle, sinon le mot sans la quantité
 * @example pluralize(année, 4) => 'années'
 * 			pluralize(année, 1) => 'année'
 * 			pluralize(pomme, 0) => ''
 * 			pluralize(mois, 4, true) => 'mois'
 */
export const pluralizeWithoutQuantity = (word, quantity, isAlwaysPlural = false) => {
	if (quantity === 0) return ''
	else if (isAlwaysPlural) return `${quantity} ${word}s`
	return `${word}${quantity > 1 ? 's' : ''}`
}

/**
 * Convertis la date sous un format DD/MM/YYYY HH:MM:SS
 * @param {Date} date
 * @returns date sous un format DD/MM/YYYY HH:MM:SS
 * @example convertDate(new Date('15 Nov 2020 14:24:39')) => '15/11/2020 14:24:39'
 */
export const convertDate = date =>
	new Intl.DateTimeFormat('fr-FR', {
		timeZone: process.env.TIMEZONE,
		year: 'numeric',
		month: 'long',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)

/**
 * Convertis la date sous un format Y années M mois D jours H heures M minutes
 * @param {Date} date
 * @returns date sous un format Y années M mois D jours H heures M minutes ou "Il y a moins d'une minute"
 * @example diffDate(new Date('26 Oct 2015 12:24:29')) => '5 années 20 jours 2 heures 19 minutes'
 */
export const diffDate = date => {
	const diff = new Date() - date
	const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375 * 12))
	const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30.4375)) % 12)
	const days = Math.floor(((diff / (1000 * 60 * 60 * 24)) % 365.25) % 30.4375)
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

	const total = []
	if (years) total.push(pluralize('année', years))
	if (months) total.push(pluralize('mois', months, true))
	if (days) total.push(pluralize('jour', days))
	if (hours) total.push(pluralize('heure', hours))
	if (minutes) total.push(pluralize('minute', minutes))

	if (!total.length) return "Il y a moins d'une minute"

	return total.join(' ')
}

/**
 * Convertis un nombre de secondes au format H heures M minutes S secondes
 * @param {Number} secondsInput nombre de secondes à convertir
 * @returns nombre de secondes au format H heures M minutes S secondes
 * @example convertSecondsToString(8590) => '2 heures 23 minutes 10 secondes'
 */
export const convertSecondsToString = secondsInput => {
	const hours = Math.floor(secondsInput / 3600)
	const minutes = Math.floor((secondsInput - hours * 3600) / 60)
	const seconds = secondsInput - hours * 3600 - minutes * 60

	const total = []
	if (hours) total.push(pluralize('heure', hours))
	if (minutes) total.push(pluralize('minute', minutes))
	if (seconds) total.push(pluralize('seconde', seconds))

	return total.join(' ')
}

/**
 * Check si le fichier est une image (extensions de type png, jpeg, jpg, gif, webp)
 * @param {string} fileName nom du fichier
 * @returns true si le fichier est une image, sinon false
 * @example isImage('image.png') => true
 * 			isImage('document.pdf') => false
 */
export const isImage = fileName => {
	const format = fileName.split('.').pop().toLowerCase()
	return Boolean(format.match(/png|jpeg|jpg|gif|webp/))
}

/**
 * Renomme l'utilisateur si son pseudo commence par un caractère spécial
 * @param {GuildMember} guildMember
 * @returns promesse de la modification du pseudo ou une promesse résolue
 */
export const modifyWrongUsernames = guildMember => {
	// Trigger si le premier caractère n'est pas "normal" ou s'il vaut "Change ton pseudo"
	const triggerRegex = /^[^a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ].*/

	// S'il s'est déjà fait changé son pseudo
	if (guildMember.nickname === 'Change ton pseudo') {
		// Si son pseudo d'utilisateur est correct, on supprime son pseudo
		if (!guildMember.user.username.match(triggerRegex)) return guildMember.setNickname(null)
		// Sinon, il garde "Change ton pseudo" comme pseudo
		return Promise.resolve()
	}

	// Si son nom de compte ou son pseudo est incorrect
	if (guildMember.displayName.match(triggerRegex)) {
		// Si son nom de compte est correct, on enlève son pseudo
		if (!guildMember.user.username.match(triggerRegex)) return guildMember.setNickname(null)
		// Sinon on le renomme "Change ton pseudo"
		return guildMember.setNickname('Change ton pseudo')
	}

	return Promise.resolve()
}

/**
 * Enlève l'extension d'un fichier
 * @param {string} fileName nom du fichier
 * @returns le nom du fichier sans son extension
 * @example removeFileExtension('document.pdf') => 'document'
 */
export const removeFileExtension = fileName => {
	const fileArray = fileName.split('.')
	fileArray.pop()
	return fileArray.join('.')
}

/**
 * Retourne le type du fichier et son nom
 * @param {string} file nom du fichier
 * @returns nom et type du fichier
 * @example getFileInfos(fichier.exemple.pdf) => { name: 'fichier.exemple', type: 'pdf'}
 */
export const getFileInfos = file => {
	const fileNameSplited = file.split('.')
	const filetType = fileNameSplited.pop()
	return {
		name: fileNameSplited.join('.'),
		type: filetType,
	}
}

/**
 *
 * @param {GuildMember} guildMember
 * @param {User} user
 * @returns le pseudo du guildMember ou le tag de l'user
 */
export const displayNameAndID = (guildMember, user) => {
	if (guildMember && guildMember.displayName)
		return `${guildMember.displayName} (ID ${guildMember.id})`

	if (user && user.username) return `${user.username} (ID ${user.id})`

	return '?'
}

/**
 * Ferme proprement l'application
 * @param {'SIGINT' | 'SIGTERM'} signal received
 * @param {Client} client Discord.js
 */
export const closeGracefully = (signal, client) => {
	console.log(`Received signal to terminate : ${signal}`)

	client.destroy()
	console.log('Discord client successfully destroyed')

	process.exit(0)
}

/**
 * Convertis la date sous un format utilisé par Discord pour afficher une date
 * @param {Date} date
 */
export const convertDateForDiscord = date => `<t:${Math.round(new Date(date) / 1000)}>`

/**
 * Gère les options d'une intéraction (slash-command)
 * @param {Data} data
 * @param {Array} options
 */
export const manageOptions = (data = null, options = []) => {
	if (!data) return
	options.map(option => {
		const name = option.name ? option.name : option.type
		if (option.type === 'mentionable')
			data.addMentionableOption(opt =>
				opt.setName(name).setDescription(option.optDesc || 'Membre (rôles non compris)'),
			)
		else if (option.type === 'input')
			data.addStringOption(opt =>
				opt.setName(name).setDescription(option.optDesc || 'Chaîne de caractère'),
			)
		else if (option.type === 'int')
			data.addIntegerOption(opt =>
				opt.setName(name).setDescription(option.optDesc || 'Entier'),
			)
		else if (option.type === 'bool')
			data.addBooleanOption(opt =>
				opt.setName(name).setDescription(option.optDesc || 'Choix binaire (booléan)'),
			)
		else if (option.type === 'user')
			data.addUserOption(opt =>
				opt.setName(name).setDescription(option.optDesc || 'Membre (bots non compris)'),
			)
		else if (option.type === 'channel')
			data.addChannelOption(opt =>
				opt.setName(name).setDescription(option.optDesc || 'Salon'),
			)
		else if (option.type === 'role')
			data.addRoleOption(opt => opt.setName(name).setDescription(option.optDesc || 'Rôle'))
	})
	return data
}

/**
 * Permet de (re)répondre à une interaction via des paramètres optionnels
 * @param {Interaction} interaction L'interaction à utiliser (requis)
 * @param {string} content Contenu du message à envoyer (optionnel)
 * @param {MessageButton|MessageSelectMenu} components Bouton/Menu déroulant
 * @param {MessageEmbed} embeds Embeds
 * @param {MessageAttachment} files Fichier(s) à attacher à la réponse interaction
 * @param {boolean} isSilent
 * @param {boolean} isEdit
 * @param {boolean} isDelete
 * @param {int} timeoutDelete Temps avec suppresion de la réponse à l'interaction (0 = default (pas de suppression))
 * @returns {void}
 */
export const interactionReply = ({
	interaction,
	content = null,
	components = [],
	embeds = [],
	files = [],
	isSilent = false,
	isEdit = false,
	isDelete = false,
	fetchReply = false,
	timeoutDelete = 0,
}) => {
	const obj = {
		components,
		ephemeral: isSilent,
		embeds,
		files,
	}

	if (content) obj.content = content

	if (!interaction) console.error('Interaction manquante')
	else if (interaction.replied || interaction.deferred)
		if (isEdit) interaction.editReply(obj)
		else if (isDelete) interaction.deleteReply(obj)
		else interaction.followUp(obj)
	else interaction.reply(obj)

	if (fetchReply || timeoutDelete <= 0) return interaction.fetchReply()

	setTimeout(() => {
		interaction.deleteReply().catch(console.error)
	}, timeoutDelete)
}
