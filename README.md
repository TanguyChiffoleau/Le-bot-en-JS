
# Le-bot-en-JS

![Node.js CI](https://github.com/TanguyChiffoleau/Le-bot-en-JS/workflows/Node.js%20CI/badge.svg?branch=master)

## Setup

### Variables d'environnement

- Renommer les fichiers `bot.example.env` et `database.example.env` en `bot.env` et `database.env` respectivement, puis modifier les variables d'environnement pour la base de données ainsi que le token du bot.

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
