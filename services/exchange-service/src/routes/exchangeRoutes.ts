import { Router } from "express";
import { getUserExchanges } from "../controllers/exchangeController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";

const router = Router();

router.get(
    "/my-exchanges",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getUserExchanges
);

export default router;
