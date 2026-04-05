# Blackjack 21 — Tests API pour Browser Agent

## Pre-requis

Avant de lancer les tests, assure-toi que :

1. Docker Compose tourne : `docker compose up -d` depuis la racine du projet
2. Le serveur est demarre : `npm run dev` depuis le dossier `server/`
3. Le seed a ete execute : `npx prisma db seed` depuis le dossier `server/`

Base URL : `http://localhost:3000`

---

## Scenario 1 : Creer une partie (succes)

1. Ouvre le navigateur et envoie une requete `POST` vers `http://localhost:3000/api/parties` avec le header `Content-Type: application/json` et le body `{"joueurId": 1}`
2. Verifie que le status de la reponse est `201`
3. Verifie que la reponse JSON contient un champ `id` (nombre)
4. Verifie que le champ `statut` vaut `"en_cours"`
5. Verifie que le champ `resultat` vaut `null`
6. Verifie que le champ `scoreJoueur` vaut `0`
7. Verifie que le champ `scoreCroupier` vaut `0`

---

## Scenario 2 : Creer une partie sans body (erreur 400)

1. Envoie une requete `POST` vers `http://localhost:3000/api/parties` avec le header `Content-Type: application/json` et le body `{}`
2. Verifie que le status de la reponse est `400`
3. Verifie que la reponse JSON contient un champ `error`

---

## Scenario 3 : Creer une partie avec un joueur inexistant (erreur 404)

1. Envoie une requete `POST` vers `http://localhost:3000/api/parties` avec le header `Content-Type: application/json` et le body `{"joueurId": 999}`
2. Verifie que le status de la reponse est `404`
3. Verifie que la reponse JSON contient un champ `error`

---

## Scenario 4 : Consulter l'historique d'un joueur (succes)

1. Ouvre `http://localhost:3000/api/joueurs/1/historique` dans le navigateur (requete GET)
2. Verifie que le status de la reponse est `200`
3. Verifie que la reponse est un tableau JSON (array)
4. Verifie que le tableau contient au moins 2 parties
5. Verifie que chaque partie a un champ `statut` qui vaut `"terminee"`
6. Verifie que chaque partie a un champ `resultat` (parmi `"victoire"`, `"defaite"`, `"egalite"`)
7. Verifie que chaque partie contient un tableau `mainCartes`
8. Verifie que chaque element de `mainCartes` contient un objet `carte` avec les champs `valeur`, `enseigne` et `points`

---

## Scenario 5 : Historique d'un joueur inexistant (erreur 404)

1. Ouvre `http://localhost:3000/api/joueurs/999/historique` dans le navigateur (requete GET)
2. Verifie que le status de la reponse est `404`
3. Verifie que la reponse JSON contient un champ `error`

---

## Scenario 6 : Historique avec un id invalide (erreur 400)

1. Ouvre `http://localhost:3000/api/joueurs/abc/historique` dans le navigateur (requete GET)
2. Verifie que le status de la reponse est `400`
3. Verifie que la reponse JSON contient un champ `error`
