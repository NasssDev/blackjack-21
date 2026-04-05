import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { joueurId } = req.body;

    if (!joueurId || typeof joueurId !== "number") {
      res.status(400).json({ error: "joueurId est requis et doit être un nombre." });
      return;
    }

    const joueur = await prisma.joueur.findUnique({
      where: { id: joueurId },
    });

    if (!joueur) {
      res.status(404).json({ error: "Joueur non trouvé." });
      return;
    }

    const partie = await prisma.partie.create({
      data: {
        joueurId,
      },
    });

    res.status(201).json(partie);
  } catch (error) {
    console.error("Erreur lors de la création de la partie:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

export default router;
