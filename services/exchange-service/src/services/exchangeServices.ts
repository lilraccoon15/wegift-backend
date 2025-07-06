import { Op, Sequelize } from "sequelize";
import { Exchange, Participants, Rules } from "../models/setupAssociations";
import { NotFoundError } from "../errors/CustomErrors";

export const getAllMyExchanges = async (userId: string) => {
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
                required: false,
            },
        ],
        where: {
            [Op.or]: [{ userId }, { "$participants.userId$": userId }],
        },
        group: ["Exchange.id"],
    });

    return exchanges;
};

export const getAllExchangeRules = async () => {
    const rules = await Rules.findAll({
        attributes: ["id", "title", "description"],
    });

    return rules;
};

export const createNewExchange = async (
    userId: string,
    title: string,
    status: "pending",
    endDate: Date,
    startDate: Date,
    description?: string,
    picture?: string,
    budget?: number,
    participantIds: string[] = [],
    ruleIds: string[] = []
) => {
    const exchange = await Exchange.create({
        userId,
        title,
        status,
        endDate,
        startDate,
        description,
        picture,
        budget,
    });

    if (participantIds.length > 0) {
        const participantsData = participantIds.map((participantId) => ({
            userId: participantId,
            exchangeId: exchange.id,
        }));
        await Participants.bulkCreate(participantsData);
    }

    if (ruleIds.length > 0) {
        await exchange.setRules(ruleIds);
    }

    await exchange.reload({
        include: [
            { model: Participants, as: "participants" },
            { model: Rules, as: "rules" },
        ],
    });

    return exchange;
};

export const updateExchangeById = async (
    id: string,
    userId: string,
    title: string,
    status: "pending" | "active" | "finished",
    endDate: Date,
    startDate: Date,
    description?: string,
    picture?: string,
    budget?: number,
    participantIds: string[] = [],
    ruleIds: string[] = []
) => {
    const exchange = await Exchange.findByPk(id, {
        include: [
            { model: Participants, as: "participants" },
            { model: Rules, as: "rules" },
        ],
    });

    if (!exchange) throw new NotFoundError("Échange non trouvé");

    if (exchange.userId !== userId) {
        throw new Error("Accès refusé à cet échange.");
    }

    exchange.title = title;
    exchange.status = status;
    exchange.endDate = endDate;
    exchange.startDate = startDate;
    if (description !== undefined) exchange.description = description;
    if (picture !== undefined) exchange.picture = picture;
    if (budget !== undefined) exchange.budget = budget;

    await exchange.save();

    await Participants.destroy({ where: { exchangeId: exchange.id } });

    if (participantIds.length > 0) {
        const newParticipants = participantIds.map((participantId) => ({
            userId: participantId,
            exchangeId: exchange.id,
        }));
        await Participants.bulkCreate(newParticipants);
    }

    if (ruleIds.length > 0) {
        await exchange.setRules(ruleIds);
    } else {
        await exchange.setRules([]);
    }

    await exchange.reload({
        include: [
            { model: Participants, as: "participants" },
            { model: Rules, as: "rules" },
        ],
    });

    return exchange;
};

export const deleteExchangeById = async (id: string) => {
    const exchange = await Exchange.findByPk(id);

    if (!exchange) throw new NotFoundError("Echange non trouvé");

    await exchange.destroy();
};

export const getExchangeById = async (id: string, userId: string) => {
    const exchange = await Exchange.findOne({
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
                required: false,
            },
        ],
        where: {
            [Op.and]: [
                {
                    [Op.or]: [{ userId }, { "$participants.userId$": userId }],
                },
                { id},
            ],
        },
        group: ["Exchange.id"],
    });

    return exchange;
};

export const searchExchangeByTitle = async (query: string) => {
    const searchTerm = query.toLowerCase();

    const results = await Exchange.findAll({
        where: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("title")), {
            [Op.like]: `%${searchTerm}%`,
        }),
    });

    return results;
};