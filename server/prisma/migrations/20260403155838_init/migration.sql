-- CreateTable
CREATE TABLE "joueur" (
    "id_joueur" SERIAL NOT NULL,
    "pseudo" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "joueur_pkey" PRIMARY KEY ("id_joueur")
);

-- CreateTable
CREATE TABLE "carte" (
    "id_carte" SERIAL NOT NULL,
    "valeur" VARCHAR(10) NOT NULL,
    "enseigne" VARCHAR(10) NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "carte_pkey" PRIMARY KEY ("id_carte")
);

-- CreateTable
CREATE TABLE "partie" (
    "id_partie" SERIAL NOT NULL,
    "id_joueur" INTEGER NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'en_cours',
    "resultat" VARCHAR(20),
    "score_joueur" INTEGER NOT NULL DEFAULT 0,
    "score_croupier" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "partie_pkey" PRIMARY KEY ("id_partie")
);

-- CreateTable
CREATE TABLE "main_carte" (
    "id_main_carte" SERIAL NOT NULL,
    "id_partie" INTEGER NOT NULL,
    "id_carte" INTEGER NOT NULL,
    "appartenance" VARCHAR(10) NOT NULL,
    "ordre" INTEGER NOT NULL,

    CONSTRAINT "main_carte_pkey" PRIMARY KEY ("id_main_carte")
);

-- CreateIndex
CREATE UNIQUE INDEX "joueur_pseudo_key" ON "joueur"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "joueur_email_key" ON "joueur"("email");

-- AddForeignKey
ALTER TABLE "partie" ADD CONSTRAINT "partie_id_joueur_fkey" FOREIGN KEY ("id_joueur") REFERENCES "joueur"("id_joueur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_carte" ADD CONSTRAINT "main_carte_id_partie_fkey" FOREIGN KEY ("id_partie") REFERENCES "partie"("id_partie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_carte" ADD CONSTRAINT "main_carte_id_carte_fkey" FOREIGN KEY ("id_carte") REFERENCES "carte"("id_carte") ON DELETE RESTRICT ON UPDATE CASCADE;
