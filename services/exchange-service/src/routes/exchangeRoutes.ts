import { Router } from "express";
import {
    createExchange,
    deleteExchange,
    getExchangeRules,
    getMyExchange,
    getMyExchanges,
    searchExchange,
    updateExchange,
} from "../controllers/exchangeController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
import { upload } from "../middlewares/upload";

const router = Router();

router.get(
    "/my-exchanges",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyExchanges
);

router.get(
    "/get-rules",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getExchangeRules
);
router.post(
    "/create-exchange",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    createExchange
);
router.get(
    "/my-exchange/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyExchange
);
router.put(
    "/update-exchange/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    updateExchange
);

router.delete(
    "/delete-exchange/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    deleteExchange
);

router.get(
    "/search",
    verifyTokenMiddleware,
    ensureAuthenticated,
    searchExchange
);

export default router;
