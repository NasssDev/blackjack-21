# Activite 3 — BDD + API REST Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mettre en place la BDD PostgreSQL avec Prisma et creer les 2 premieres routes API REST du Blackjack 21.

**Architecture:** Serveur Express TypeScript dans `server/`, Prisma comme ORM connecte a PostgreSQL, seed pour les donnees de test, routes REST avec gestion d'erreurs.

**Tech Stack:** Node.js, Express, TypeScript, Prisma, PostgreSQL, tsx (dev runner)

---

### Task 1: Initialize server project

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.env.example`

**Step 1: Create server directory and init npm**

```bash
cd /home/nasssdev/Documents/Ynov/blackjack-21
mkdir -p server
cd server
npm init -y
```

**Step 2: Install dependencies**

```bash
npm install express @prisma/client
npm install -D typescript @types/express @types/node tsx prisma
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Create .env.example**

```
DATABASE_URL="postgresql://user:password@localhost:5432/blackjack21"
PORT=3000
```

**Step 5: Add scripts to package.json**

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Step 6: Commit**

```bash
git add server/package.json server/package-lock.json server/tsconfig.json server/.env.example
git commit -m "feat(server): initialize Node.js + TypeScript project with dependencies"
```

---

### Task 2: Create Prisma schema

**Files:**
- Create: `server/prisma/schema.prisma`

**Step 1: Initialize Prisma**

```bash
cd /home/nasssdev/Documents/Ynov/blackjack-21/server
npx prisma init
```

This creates `prisma/schema.prisma` and `.env`.

**Step 2: Write the Prisma schema matching the MLD**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Joueur {
  id              Int       @id @default(autoincrement()) @map("id_joueur")
  pseudo          String    @unique @db.VarChar(50)
  email           String    @unique @db.VarChar(100)
  motDePasse      String    @map("mot_de_passe") @db.VarChar(255)
  dateInscription DateTime  @default(now()) @map("date_inscription")
  parties         Partie[]

  @@map("joueur")
}

model Carte {
  id        Int          @id @default(autoincrement()) @map("id_carte")
  valeur    String       @db.VarChar(10)
  enseigne  String       @db.VarChar(10)
  points    Int
  mains     MainCarte[]

  @@map("carte")
}

model Partie {
  id             Int         @id @default(autoincrement()) @map("id_partie")
  joueurId       Int         @map("id_joueur")
  dateDebut      DateTime    @default(now()) @map("date_debut")
  statut         String      @default("en_cours") @db.VarChar(20)
  resultat       String?     @db.VarChar(20)
  scoreJoueur    Int         @default(0) @map("score_joueur")
  scoreCroupier  Int         @default(0) @map("score_croupier")
  joueur         Joueur      @relation(fields: [joueurId], references: [id])
  mainCartes     MainCarte[]

  @@map("partie")
}

model MainCarte {
  id            Int     @id @default(autoincrement()) @map("id_main_carte")
  partieId      Int     @map("id_partie")
  carteId       Int     @map("id_carte")
  appartenance  String  @db.VarChar(10)
  ordre         Int
  partie        Partie  @relation(fields: [partieId], references: [id])
  carte         Carte   @relation(fields: [carteId], references: [id])

  @@map("main_carte")
}
```

**Step 3: Set DATABASE_URL in server/.env**

```
DATABASE_URL="postgresql://user:password@localhost:5432/blackjack21"
PORT=3000
```

(User must adjust credentials to their local PostgreSQL.)

**Step 4: Run first migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration creates 4 tables in PostgreSQL.

**Step 5: Commit**

```bash
git add server/prisma/schema.prisma server/prisma/migrations/
git commit -m "feat(server): add Prisma schema matching MLD (4 tables)"
```

---

### Task 3: Create Prisma client singleton

**Files:**
- Create: `server/src/lib/prisma.ts`

**Step 1: Create the shared Prisma instance**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

**Step 2: Commit**

```bash
git add server/src/lib/prisma.ts
git commit -m "feat(server): add shared Prisma client instance"
```

---

### Task 4: Create Express server entry point

**Files:**
- Create: `server/src/index.ts`

**Step 1: Write the Express server**

```typescript
import express from "express";
import partiesRouter from "./routes/parties.js";
import joueursRouter from "./routes/joueurs.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/parties", partiesRouter);
app.use("/api/joueurs", joueursRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Step 2: Commit (will commit together with routes in Task 5/6)**

---

### Task 5: Create POST /api/parties route

**Files:**
- Create: `server/src/routes/parties.ts`

**Step 1: Write the route**

```typescript
import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/", async (req, res) => {
  const { joueurId } = req.body;

  if (!joueurId || typeof joueurId !== "number") {
    res.status(400).json({ error: "joueurId (number) est requis" });
    return;
  }

  try {
    const joueur = await prisma.joueur.findUnique({
      where: { id: joueurId },
    });

    if (!joueur) {
      res.status(404).json({ error: "Joueur introuvable" });
      return;
    }

    const partie = await prisma.partie.create({
      data: { joueurId },
    });

    res.status(201).json(partie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
```

**Step 2: Test with HTTP client**

```http
POST http://localhost:3000/api/parties
Content-Type: application/json

{ "joueurId": 1 }
```

Expected: `201` with partie object (after seed data exists).

---

### Task 6: Create GET /api/joueurs/:id/historique route

**Files:**
- Create: `server/src/routes/joueurs.ts`

**Step 1: Write the route**

```typescript
import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/:id/historique", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "ID joueur invalide" });
    return;
  }

  try {
    const joueur = await prisma.joueur.findUnique({
      where: { id },
    });

    if (!joueur) {
      res.status(404).json({ error: "Joueur introuvable" });
      return;
    }

    const parties = await prisma.partie.findMany({
      where: {
        joueurId: id,
        statut: "terminee",
      },
      orderBy: { dateDebut: "desc" },
      include: {
        mainCartes: {
          include: { carte: true },
          orderBy: { ordre: "asc" },
        },
      },
    });

    res.json(parties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
```

**Step 2: Commit routes + server entry point**

```bash
git add server/src/
git commit -m "feat(server): add Express server with POST /parties and GET /joueurs/:id/historique"
```

---

### Task 7: Create seed script

**Files:**
- Create: `server/prisma/seed.ts`

**Step 1: Write the seed**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VALEURS = ["As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Valet", "Dame", "Roi"];
const ENSEIGNES = ["Coeur", "Carreau", "Trefle", "Pique"];

function getPoints(valeur: string): number {
  if (valeur === "As") return 11;
  if (["Valet", "Dame", "Roi"].includes(valeur)) return 10;
  return parseInt(valeur);
}

async function main() {
  // Clean existing data
  await prisma.mainCarte.deleteMany();
  await prisma.partie.deleteMany();
  await prisma.carte.deleteMany();
  await prisma.joueur.deleteMany();

  // Create 2 joueurs
  const joueur1 = await prisma.joueur.create({
    data: {
      pseudo: "Alice",
      email: "alice@example.com",
      motDePasse: "hashed_password_1",
    },
  });

  const joueur2 = await prisma.joueur.create({
    data: {
      pseudo: "Bob",
      email: "bob@example.com",
      motDePasse: "hashed_password_2",
    },
  });

  // Create 52 cartes
  const cartes = [];
  for (const enseigne of ENSEIGNES) {
    for (const valeur of VALEURS) {
      cartes.push(
        await prisma.carte.create({
          data: { valeur, enseigne, points: getPoints(valeur) },
        })
      );
    }
  }

  // Create 3 parties
  const partie1 = await prisma.partie.create({
    data: {
      joueurId: joueur1.id,
      statut: "terminee",
      resultat: "victoire",
      scoreJoueur: 21,
      scoreCroupier: 18,
    },
  });

  const partie2 = await prisma.partie.create({
    data: {
      joueurId: joueur1.id,
      statut: "terminee",
      resultat: "defaite",
      scoreJoueur: 23,
      scoreCroupier: 19,
    },
  });

  const partie3 = await prisma.partie.create({
    data: {
      joueurId: joueur2.id,
      statut: "terminee",
      resultat: "egalite",
      scoreJoueur: 20,
      scoreCroupier: 20,
    },
  });

  // Create main_carte entries (some cards dealt in each game)
  // Partie 1: Alice has As Coeur + 10 Pique = 21
  await prisma.mainCarte.createMany({
    data: [
      { partieId: partie1.id, carteId: cartes[0].id, appartenance: "joueur", ordre: 1 },
      { partieId: partie1.id, carteId: cartes[47].id, appartenance: "joueur", ordre: 2 },
      { partieId: partie1.id, carteId: cartes[20].id, appartenance: "croupier", ordre: 1 },
      { partieId: partie1.id, carteId: cartes[33].id, appartenance: "croupier", ordre: 2 },
    ],
  });

  // Partie 2: Alice busts
  await prisma.mainCarte.createMany({
    data: [
      { partieId: partie2.id, carteId: cartes[8].id, appartenance: "joueur", ordre: 1 },
      { partieId: partie2.id, carteId: cartes[21].id, appartenance: "joueur", ordre: 2 },
      { partieId: partie2.id, carteId: cartes[34].id, appartenance: "joueur", ordre: 3 },
      { partieId: partie2.id, carteId: cartes[5].id, appartenance: "croupier", ordre: 1 },
      { partieId: partie2.id, carteId: cartes[44].id, appartenance: "croupier", ordre: 2 },
    ],
  });

  // Partie 3: Bob egalite
  await prisma.mainCarte.createMany({
    data: [
      { partieId: partie3.id, carteId: cartes[9].id, appartenance: "joueur", ordre: 1 },
      { partieId: partie3.id, carteId: cartes[22].id, appartenance: "joueur", ordre: 2 },
      { partieId: partie3.id, carteId: cartes[35].id, appartenance: "croupier", ordre: 1 },
      { partieId: partie3.id, carteId: cartes[48].id, appartenance: "croupier", ordre: 2 },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Run seed**

```bash
npx prisma db seed
```

Expected: "Seed completed successfully!"

**Step 3: Commit**

```bash
git add server/prisma/seed.ts
git commit -m "feat(server): add seed script with mock data (2 joueurs, 52 cartes, 3 parties)"
```

---

### Task 8: Test routes and final verification

**Step 1: Start the server**

```bash
cd /home/nasssdev/Documents/Ynov/blackjack-21/server
npm run dev
```

**Step 2: Test POST /api/parties**

```bash
curl -X POST http://localhost:3000/api/parties \
  -H "Content-Type: application/json" \
  -d '{"joueurId": 1}'
```

Expected: `201` with new partie JSON.

**Step 3: Test GET /api/joueurs/:id/historique**

```bash
curl http://localhost:3000/api/joueurs/1/historique
```

Expected: `200` with array of 2 parties (Alice's terminated games).

**Step 4: Test error cases**

```bash
# 404 - joueur inexistant
curl http://localhost:3000/api/joueurs/999/historique

# 400 - body invalide
curl -X POST http://localhost:3000/api/parties \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `404` and `400` respectively.

**Step 5: Final commit if any adjustments**

```bash
git add -A
git commit -m "feat(server): activite 3 complete - BDD + 2 routes API REST"
```
