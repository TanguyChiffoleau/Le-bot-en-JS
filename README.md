
# Le-bot-en-JS

## Lancer le bot

### Production

#### Pré-requis

- Installer **[Docker](https://docs.docker.com/engine/install/)** _`docker -v` pour vérifier que l'installation s'est bien déroulée_.

- Installer **[Docker Compose](https://docs.docker.com/compose/install/)** _il est installé en même temps que Docker Desktop, `docker-compose -v` pour vérifier que l'installation s'est bien déroulée_.

#### Variables d'environnement

- Renommer les fichiers `bot.example.env` et `database.example.env` en `bot.env` et `database.env` respectivement, puis modifier les variables d'environnement pour la base de données ainsi que le token du bot.

#### Lancement et arrêt

- Lancer l'application avec `npm run docker-start`.
- `npm run docker-stop` pour l'arrêter.

### Développement

#### Setup

- Il est nécessaire d'avoir [Nodejs](https://nodejs.org/fr/) 12.0.0 ou plus récent (l'application tourne sous 12.8.2 en production).

- Pour conserver un environnement de développement sain et cohérant, il est nécessaire d'utiliser un linter (ici, [ESLint](https://eslint.org/)) et [Prettier](https://prettier.io/). Il est **obligatoire** avant chaque commit de tester le code en utilisant `npm test`.
