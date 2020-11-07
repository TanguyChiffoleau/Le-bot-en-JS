# Le-bot-en-JS

[![Release](https://img.shields.io/github/v/release/TanguyChiffoleau/Le-bot-en-JS?include_prereleases)](https://github.com/TanguyChiffoleau/Le-bot-en-JS/releases)
[![Version](https://img.shields.io/github/package-json/v/TanguyChiffoleau/Le-bot-en-JS)](https://github.com/TanguyChiffoleau/Le-bot-en-JS/blob/master/package.json)
[![Discord.js version](https://img.shields.io/github/package-json/dependency-version/TanguyChiffoleau/Le-bot-en-JS/discord.js)](https://github.com/TanguyChiffoleau/Le-bot-en-JS/blob/146c5cc906dfc667edffe384e225e4dab689bd0a/package.json#L23)
[![Node.js CI](https://github.com/TanguyChiffoleau/Le-bot-en-JS/workflows/Node.js%20CI/badge.svg?branch=master&event=push)](https://github.com/TanguyChiffoleau/Le-bot-en-JS/actions?query=workflow%3A%22Node.js+CI%22+event%3Apush)

## Table des matières

- [Le-bot-en-JS](#le-bot-en-js)
  - [Table des matières](#table-des-matières)
  - [À propos](#à-propos)
  - [Fonctionnalités](#fonctionnalités)
  - [Setup en production](#setup-en-production)
  - [Ressources](#ressources)
  - [Contribuer](#contribuer)


## À propos

Le-bot-en-JS est un bot discord open-source codé en JS conçu primairement et spécialement pour le serveur discord **Entraide Informatique - Capet & CTRL-F**.

[![Discord entraide](https://img.shields.io/discord/475253577288253440?color=%237289DA&logo=discord&logoColor=white)](https://www.discord.gg/informatique)


## Fonctionnalités

blabla

## Setup en production

L'application est capable de tourner sous plusieurs environnements :

-   n'importe quel environnement avec Node.js d'installé
-   dans un container Docker via
    -   le CLI
    -   Docker Compose

<details id="classique">
<summary><b>Setup "classique" avec Node.js</b></summary>

#### Prérequis

1. Il est nécessaire d'avoir [Node.js](https://nodejs.org/fr/) 12.0.0 ou plus récent d'installé sur votre machine.

    > Utilisez la commande `node -v` pour vous assurez que Node est bien installé et que sa version est suffisante.

    > À titre indicatif, l'application tourne sous Node.js v14.15.0 en production.

2. Téléchargez le code de l'application sur votre machine. _cf. [Télécharger le code de l'application sur votre machine](#download)_

3. Il faut au préalable installer les dépendences de l'application avant de la lancer celle-ci en utilisant la commande `npm i`.

    > Toutes les dépendences vont être installés, y compris celles prévus pour les développeurs, car le package [dotenv](https://www.npmjs.com/package/dotenv) est nécessaire. Ci toutefois vous avez appliqué les variables d'environnement à l'application par vos propres moyens, seule la commande `npm i --production` est nécessaire.

4. Renommer le fichier `bot.example.env` en `bot.env`, puis modifier les variables d'environnement pour que l'application fonctionne correctement. _cf. [Variables d'environnement](#environnement)_

#### Lancement de l'application

-   Vous pouvez utiliser `npm start` pour lancer l'application.

    > Vous pouvez utiliser un gestionnaire d'application comme [PM2](https://pm2.keymetrics.io/) pour faciliter la gestion de l'application. [Tuto](https://discordjs.guide/improving-dev-environment/pm2.html)

#### Arrêt de l'application

-   Vous pouvez utiliser la combinaison de touches Ctrl+C pour tuer l'application.

</details>

<details>
<summary id="compose"><b>Setup avec Docker Compose</b></summary>

#### Prérequis

1. Il est nécessaire d'avoir [Docker](https://docs.docker.com/get-docker/) ainsi que [Docker Compose](https://docs.docker.com/compose/install/) d'installé.

    > Utilisez les commandes `docker -v` et `docker-compose -v` pour vérifier que les deux applications soient bien installés.

2. Téléchargez le code de l'application sur votre machine. _cf. [Télécharger le code de l'application sur votre machine](#download)_

3. Renommer le fichier `bot.example.env` en `bot.env`, puis modifier les variables d'environnement pour que l'application fonctionne correctement. _cf. [Variables d'environnement](#environnement)_

    > Seul le dossier `config` avec les fichiers `bot.env` et `reactionRoleConfig.json` ainsi que le dossier `docker` avec le fichier `docker-compose.yml` sont nécessaires, en effet, le code sera lui directement intégré dans l'image docker. Vous pouvez supprimer les autres dossiers et fichiers si vous le souhaitez.

    > La structure des dossiers et fichiers devrait ressembler à ça :
    >
    > ```
    > .
    > ├── config
    > │   ├── bot.env
    > │   └── reactionRoleConfig.json
    > └── docker
    > 	└── docker-compose.yml
    > ```

#### Lancement de l'application

-   Vous pouvez utiliser les commandes `docker pull tanguychiffoleau/le-bot-en-js:latest` puis `docker-compose -f ./docker/docker-compose.yml up -d` pour lancer l'application.

    > docker pull va télécharger ou mettre à jour si besoin l'image de l'application hébergée sur [Docker Hub](https://hub.docker.com/repository/docker/tanguychiffoleau/le-bot-en-js). Le tag ici est `latest` ce qui correspond, de fait, au code présent sur la branche [master](https://github.com/TanguyChiffoleau/Le-bot-en-JS/tree/master/). Vous pouvez spécifier une version spécifique comme par exemple `2.0.0`. _cf. [liste des tags disponibles](https://hub.docker.com/repository/registry-1.docker.io/tanguychiffoleau/le-bot-en-js/tags?page=1) ainsi que leur [version correspondante](https://github.com/TanguyChiffoleau/Le-bot-en-JS/releases)_

    > docker-compose va lancer le container avec les règles définies dans `docker-compose.yml`.

    > Pour plus d'infos sur les technologies liées à Docker utilisées ici, vous pouvez consulter leur [documentation](https://docs.docker.com/reference/) ou leur [manuel](https://docs.docker.com/engine/).

#### Arrêt de l'application

-   Vous pouvez utiliser la commande `docker-compose -f ./docker/docker-compose.yml stop` pour stopper le container. Pour le supprimer, utilisez la commande `docker-compose -f ./docker/docker-compose.yml down`.

</details>

## Ressources

</details>

<details id='download'>
<summary><b>Télécharger le code de l'application sur votre machine</b></summary>

Vous pouvez télécharger le code de l'application sur votre machine

-   en [clonant le repository](https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/cloning-a-repository)
-   ou en téléchargeant le code source ![télcharger le code source](./doc/images/download.png 'Télcharger le code source')

</details>

<details id='environnement'>
<summary><b>Variables d'environnement</b></summary>

Le bot repose sur les variables d'environnement pour pouvoir fonctionner.

> Pour pouvoir récupérer les identifiants (ID) sur discord, il faut activer le [mode développeur](https://support.discord.com/hc/fr/articles/206346498-O%C3%B9-trouver-l-ID-de-mon-compte-utilisateur-serveur-message-).

#### Fichier bot.env

| Variable              | Description                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| DISCORD_TOKEN         | [Token secret du bot discord](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token) |
| PREFIX                | Préfixe utilisé pour intéragir avec le bot                                                                       |
| GUILD_ID              | ID du serveur (= guild) sur lequel le bot est utilisé                                                            |
| LEAVE_JOIN_CHANNEL_ID | ID du channel sur lequel les messages de départs/arrivées seront postés                                          |
| REPORT_CHANNEL        | ID du channel sur lequel les messages de signalement seront postés                                               |
| LOGS_CHANNEL          | ID du channel sur lequel les messages de logs seront postés                                                      |

</details>

## Contribuer

Regardez le [guide de contribution](./.github/CONTRIBUTING.md) si vous voulez soumettre une pull request.
