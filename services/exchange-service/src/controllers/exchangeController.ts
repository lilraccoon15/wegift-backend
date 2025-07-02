import { getAllUserExchanges } from "../services/exchangeServices";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";

export const getUserExchanges = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const exchanges = await getAllUserExchanges(userId);

        sendSuccess(res, "Echanges trouvés", { exchanges }, 200);
    }
);
