import { Router } from "express";

import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { upload } from "../middlewares/upload";

import {
  cancelDrawExchange,
  createExchange,
  deleteExchange,
  drawExchange,
  getExchange,
  getExchangeRules,
  getExchanges,
  getMyExchange,
  getMyExchanges,
  respondToExchangeInvitation,
  searchExchange,
  updateExchange,
} from "../controllers/exchangeController";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

router.get("/my-exchanges", ...requireAuth, getMyExchanges);
router.get("/exchanges/:userId", ...requireAuth, getExchanges);
router.get("/get-rules", ...requireAuth, getExchangeRules);
router.get("/my-exchange/:id", ...requireAuth, getMyExchange);
router.get("/exchange/:id", ...requireAuth, getExchange);
router.get("/search", ...requireAuth, searchExchange);

router.post(
  "/create-exchange",
  ...requireAuth,
  upload.single("picture"),
  createExchange
);
router.put(
  "/update-exchange/:id",
  ...requireAuth,
  upload.single("picture"),
  updateExchange
);

router.delete("/delete-exchange/:id", ...requireAuth, deleteExchange);

router.patch(
  "/exchange/:requesterId/respond",
  ...requireAuth,
  respondToExchangeInvitation
);
router.post("/draw/:exchangeId", ...requireAuth, drawExchange);
router.delete("/cancel-draw/:exchangeId", ...requireAuth, cancelDrawExchange);

export default router;
