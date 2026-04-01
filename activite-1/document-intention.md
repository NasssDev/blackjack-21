# Blackjack 21 — Document d'intention

## 1. Objectif du jeu

Blackjack 21 est un jeu de cartes en ligne où le joueur affronte un croupier géré par le serveur. L'objectif est d'obtenir un score le plus proche possible de 21, sans le dépasser. Le jeu se déroule au tour par tour : le joueur choisit de piocher une carte supplémentaire ou de s'arrêter. Le croupier joue ensuite automatiquement selon une règle simple : il pioche tant que son score est inférieur à 17.

**Thématique :** ambiance casino rétro avec un rendu visuel sobre (couleurs vert foncé, doré, fond sombre), centré sur la lisibilité et l'expérience utilisateur.

## 2. Architecture proposée

L'architecture suit un modèle client-serveur classique en trois couches :

- **Client (Front-End) :** application React (Vite) qui affiche l'interface du jeu et communique avec le serveur via des requêtes HTTP.
- **Serveur (Back-End) :** API REST construite avec Node.js et Express. Elle gère la logique métier (règles du Blackjack, IA du croupier, gestion du deck) et communique avec la base de données.
- **Base de données :** PostgreSQL, accédée via un ORM (Sequelize ou Prisma) pour stocker les joueurs, les parties et l'historique des scores.

### 2.1 Flux de communication

Le client n'a jamais accès directement à la base de données. Toutes les interactions passent par l'API REST. Le serveur est le seul garant des règles du jeu : il gère le deck de cartes, valide les actions du joueur et calcule les scores. Cela empêche toute triche côté client.

### 2.2 Principaux endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/parties` | Créer une nouvelle partie |
| POST | `/api/parties/:id/piocher` | Piocher une carte |
| POST | `/api/parties/:id/rester` | Terminer le tour du joueur |
| GET | `/api/joueurs/:id/historique` | Consulter l'historique des parties |

## 3. Choix technologiques

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Front-End | React (Vite) | Composants réutilisables, rendu rapide, écosystème large et bien documenté. |
| Back-End | Node.js + Express | Léger, performant, même langage (JS) front et back, facilitant la coordination. |
| BDD | PostgreSQL | BDD relationnelle robuste, gratuite, conforme à la contrainte du projet. |
| ORM | Sequelize ou Prisma | Abstraction SQL, migrations facilitées, modélisation cohérente avec le MCD. |
| Communication | API REST (JSON) | Suffisant pour du tour par tour, simple à déboguer. Pas besoin de WebSockets. |

## 4. Services principaux identifiés

- **Service Authentification :** inscription et connexion du joueur (JWT ou session).
- **Service Partie :** création d'une partie, gestion du deck, distribution des cartes, calcul du score.
- **Service Croupier (IA) :** logique automatique du croupier qui pioche jusqu'à atteindre un score ≥ 17.
- **Service Historique :** enregistrement et consultation des résultats passés du joueur.

## 5. Défis techniques anticipés

- **Sécurité du deck :** le deck et les cartes du croupier ne doivent jamais être exposés au client avant la fin du tour. Toute la logique de jeu doit rester côté serveur.
- **Gestion d'état :** maintenir l'état de la partie (cartes distribuées, score en cours) de manière fiable entre les requêtes HTTP successives.
- **Cohérence front/back :** s'assurer que le contrat d'API (format des requêtes et réponses JSON) est défini en amont pour permettre un développement parallèle front et back.
- **Validation des actions :** le serveur doit vérifier que chaque action est légitime (ex. : empêcher de piocher après un bust ou après avoir choisi de rester).