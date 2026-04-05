import "dotenv/config";
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
