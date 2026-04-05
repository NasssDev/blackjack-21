import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/:id/historique", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: "L'id doit être un nombre valide." });
      return;
    }

    const joueur = await prisma.joueur.findUnique({
      where: { id },
    });

    if (!joueur) {
      res.status(404).json({ error: "Joueur non trouvé." });
      return;
    }

    const parties = await prisma.partie.findMany({
      where: {
        joueurId: id,
        statut: "terminee",
      },
      orderBy: {
        dateDebut: "desc",
      },
      include: {
        mainCartes: {
          include: {
            carte: true,
          },
          orderBy: {
            ordre: "asc",
          },
        },
      },
    });

    res.status(200).json(parties);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

export default router;
