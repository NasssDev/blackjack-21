import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Clean existing data in correct order (respect foreign keys)
  await prisma.mainCarte.deleteMany();
  await prisma.partie.deleteMany();
  await prisma.carte.deleteMany();
  await prisma.joueur.deleteMany();

  // Reset auto-increment sequences so IDs start at 1
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE main_carte_id_main_carte_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE partie_id_partie_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE carte_id_carte_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE joueur_id_joueur_seq RESTART WITH 1`);

  // 2. Create joueurs
  const alice = await prisma.joueur.create({
    data: {
      pseudo: "Alice",
      email: "alice@example.com",
      motDePasse: "hashed_password_1",
    },
  });

  const bob = await prisma.joueur.create({
    data: {
      pseudo: "Bob",
      email: "bob@example.com",
      motDePasse: "hashed_password_2",
    },
  });

  // 3. Create 52 cartes (full deck)
  const valeurs = [
    { nom: "As", points: 11 },
    { nom: "2", points: 2 },
    { nom: "3", points: 3 },
    { nom: "4", points: 4 },
    { nom: "5", points: 5 },
    { nom: "6", points: 6 },
    { nom: "7", points: 7 },
    { nom: "8", points: 8 },
    { nom: "9", points: 9 },
    { nom: "10", points: 10 },
    { nom: "Valet", points: 10 },
    { nom: "Dame", points: 10 },
    { nom: "Roi", points: 10 },
  ];
  const enseignes = ["Coeur", "Carreau", "Trefle", "Pique"];

  const cartes = [];
  for (const enseigne of enseignes) {
    for (const valeur of valeurs) {
      const carte = await prisma.carte.create({
        data: {
          valeur: valeur.nom,
          enseigne,
          points: valeur.points,
        },
      });
      cartes.push(carte);
    }
  }

  // 4. Create 3 parties
  const partie1 = await prisma.partie.create({
    data: {
      joueurId: alice.id,
      statut: "terminee",
      resultat: "victoire",
      scoreJoueur: 21,
      scoreCroupier: 18,
    },
  });

  const partie2 = await prisma.partie.create({
    data: {
      joueurId: alice.id,
      statut: "terminee",
      resultat: "defaite",
      scoreJoueur: 23,
      scoreCroupier: 19,
    },
  });

  const partie3 = await prisma.partie.create({
    data: {
      joueurId: bob.id,
      statut: "terminee",
      resultat: "egalite",
      scoreJoueur: 20,
      scoreCroupier: 20,
    },
  });

  // Helper to find a carte by valeur and enseigne
  const findCarte = (valeur: string, enseigne: string) =>
    cartes.find((c) => c.valeur === valeur && c.enseigne === enseigne)!;

  // 5. Create main_carte entries linking cards to parties
  // Partie 1: Alice wins with 21 (As + Roi) vs croupier 18 (8 + 10)
  await prisma.mainCarte.createMany({
    data: [
      { partieId: partie1.id, carteId: findCarte("As", "Coeur").id, appartenance: "joueur", ordre: 1 },
      { partieId: partie1.id, carteId: findCarte("Roi", "Pique").id, appartenance: "joueur", ordre: 2 },
      { partieId: partie1.id, carteId: findCarte("8", "Carreau").id, appartenance: "croupier", ordre: 1 },
      { partieId: partie1.id, carteId: findCarte("10", "Trefle").id, appartenance: "croupier", ordre: 2 },
    ],
  });

  // Partie 2: Alice loses with 23 (10 + 6 + 7) vs croupier 19 (9 + Dame)
  await prisma.mainCarte.createMany({
    data: [
      { partieId: partie2.id, carteId: findCarte("10", "Coeur").id, appartenance: "joueur", ordre: 1 },
      { partieId: partie2.id, carteId: findCarte("6", "Pique").id, appartenance: "joueur", ordre: 2 },
      { partieId: partie2.id, carteId: findCarte("7", "Carreau").id, appartenance: "joueur", ordre: 3 },
      { partieId: partie2.id, carteId: findCarte("9", "Trefle").id, appartenance: "croupier", ordre: 1 },
      { partieId: partie2.id, carteId: findCarte("Dame", "Coeur").id, appartenance: "croupier", ordre: 2 },
    ],
  });

  // Partie 3: Bob ties with 20 (Roi + 10) vs croupier 20 (Dame + Valet)
  await prisma.mainCarte.createMany({
    data: [
      { partieId: partie3.id, carteId: findCarte("Roi", "Coeur").id, appartenance: "joueur", ordre: 1 },
      { partieId: partie3.id, carteId: findCarte("10", "Pique").id, appartenance: "joueur", ordre: 2 },
      { partieId: partie3.id, carteId: findCarte("Dame", "Pique").id, appartenance: "croupier", ordre: 1 },
      { partieId: partie3.id, carteId: findCarte("Valet", "Carreau").id, appartenance: "croupier", ordre: 2 },
    ],
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
