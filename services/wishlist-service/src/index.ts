import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

app.get("/", (_req, res) => {
  res.send("Wishlist service is running!");
});

app.listen(PORT, () => {
  console.log(`Wishlist service listening on port ${PORT}`);
});
