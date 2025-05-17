import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.get("/", (_req, res) => {
  res.send("Exchange service is running!");
});

app.listen(PORT, () => {
  console.log(`Exchange service listening on port ${PORT}`);
});
