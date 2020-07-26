
# Le-bot-en-JS

[![Node.js CI](https://github.com/TanguyChiffoleau/Le-bot-en-JS/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/TanguyChiffoleau/Le-bot-en-JS/actions?query=workflow%3A%22Node.js+CI%22)

## Setup

### Variables d'environnement

- Renommer les fichiers `bot.example.env` et `database.example.env` en `bot.env` et `database.env` respectivement, puis modifier les variables d'environnement pour la [base de données](#databaseenv) ainsi que le [bot](#botenv).
- Pour pouvoir récupérer les identifiants (ID) sur discord, il faut activer le [mode développeur](https://support.discord.com/hc/fr/articles/206346498-O%C3%B9-trouver-l-ID-de-mon-compte-utilisateur-serveur-message-).

#### Fichier bot.env

| Variable              | Exemple                                                     | Description                                                                                                      |
| --------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| DISCORD_TOKEN         | MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZnCjm1XVW7vRze4b7Cq4se7kKWs | [Token secret du bot discord](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token) |
| PREFIX                | !                                                           | Préfixe utilisé pour intéragir avec le bot                                                                       |
| GUILD_ID              | 123456789012345678                                          | ID du serveur (= guild) sur lequel le bot est utilisé                                                            |
| LEAVE_JOIN_CHANNEL_ID | 123456789012345678                                          | ID du channel sur lequel les messages de départs/arrivées seront postés                                          |
| REPORT_CHANNEL        | 123456789012345678                                          | ID du channel sur lequel les messages de signalement seront postés                                               |

#### Fichier database.env

| Variable          | Exemple      | Description                                           |
| ----------------- | ------------ | ----------------------------------------------------- |
| POSTGRES_USER     | USER         | Nom de l'utilisateur pour la base de données          |
| POSTGRES_PASSWORD | PASSWORD     | Mot de passe de l'utilisateur pour la base de données |
| POSTGRES_DB       | POSTGRES-BOT | Nom de la base de données                             |

## Développement

### Prérequis

- Il est nécessaire d'avoir [Nodejs](https://nodejs.org/fr/) 12.0.0 ou plus récent (l'application tourne sous 12.8.2 en production).

- Pour conserver un environnement de développement sain et cohérant, il est nécessaire d'utiliser un linter (ici, [ESLint](https://eslint.org/)) et [Prettier](https://prettier.io/). Il est **obligatoire** avant chaque commit de tester le code en utilisant `npm test` (le test est fait pour chaque push sur la branche master avec GitHub Actions).

### Lancement

- Vous pouvez utiliser `npm start` pour lancer l'application ou le débogueur de votre éditeur de code.

## Production

### Prérequis

- Installer **[Docker](https://docs.docker.com/engine/install/)** _- `docker -v` pour vérifier que l'installation s'est bien déroulée_.

- Installer **[Docker Compose](https://docs.docker.com/compose/install/)** _- il est installé en même temps que Docker Desktop, `docker-compose -v` pour vérifier que l'installation s'est bien déroulée_.

### Lancement et arrêt

- Lancer l'application avec `npm run docker-start`.
- `npm run docker-stop` pour l'arrêter.
