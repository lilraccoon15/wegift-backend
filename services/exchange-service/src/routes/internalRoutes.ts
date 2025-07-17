import { Router } from "express";

import { internalAuthMiddleware } from "../middlewares/internalAuthMiddleware";
import { upload } from "../middlewares/upload";
import { deleteUserExchanges } from "../controllers/exchangeController";

const router = Router();

router.delete(
    "/delete-exchange",
    internalAuthMiddleware,
    upload.single("picture"),
    deleteUserExchanges
);

export default router;
