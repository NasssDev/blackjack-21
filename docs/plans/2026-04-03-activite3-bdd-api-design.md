# Activite 3 — BDD + API REST

## Decisions

- **ORM** : Prisma
- **Langage** : TypeScript
- **Structure** : dossier `server/` a la racine
- **BDD** : PostgreSQL
- **Routes** : `POST /api/parties` + `GET /api/joueurs/:id/historique`

## Structure

```
server/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── routes/
│   │   ├── parties.ts
│   │   └── joueurs.ts
│   ├── lib/
│   │   └── prisma.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Modele Prisma

Reprend le MLD : 4 tables (joueur, carte, partie, main_carte).

## Seed

- 2 joueurs
- 52 cartes (jeu complet)
- 3 parties avec resultats varies
- Quelques main_carte

## Routes

| Route | Description | Reponse |
|-------|-------------|---------|
| `POST /api/parties` | Cree une partie (body: `{ joueurId }`) | 201 |
| `GET /api/joueurs/:id/historique` | Parties terminees du joueur | 200 |

## Gestion d'erreurs

- 404 joueur/partie introuvable
- 400 body invalide
- 500 erreur serveur
