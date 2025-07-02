import { Sequelize } from "sequelize";
import { Exchange, Participants } from "../models/setupAssociations";

export const getAllUserExchanges = async (userId: string) => {
    const exchanges = await Exchange.findAll({
        attributes: [
            "id",
            "userId",
            "title",
            "picture",
            "description",
            "status",
            "startDate",
            "endDate",
            [
                Sequelize.fn("COUNT", Sequelize.col("participants.id")),
                "participantsCount",
            ],
        ],
        include: [
            {
                model: Participants,
                as: "participants",
                attributes: [],
                required: true,
                where: { userId },
            },
        ],
        group: ["Exchange.id"],
    });

    return exchanges;
};
