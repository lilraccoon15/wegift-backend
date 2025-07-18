import { Op, Sequelize } from "sequelize";
import {
    Assigned,
    Exchange,
    Participants,
    Rules,
    ExchangeRulesAssoc,
} from "../models/setupAssociations";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";
import { shuffleArray } from "../utils/shuffleArray";
import { validateParticipants } from "../utils/validateParticipants";
import axios from "axios";
import config from "../config";

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
        const validUserIds = await validateParticipants(userId, participantIds);

        const participantsData = validUserIds.map((participantId) => ({
            userId: participantId,
            exchangeId: exchange.id,
        }));

        await Participants.bulkCreate(participantsData);

        const notificationPayloads = validUserIds
            .filter((participantId) => participantId !== userId)
            .map((participantId) =>
                axios.post(
                    `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
                    {
                        userId: participantId,
                        type: "exchange-invite",
                        data: { requesterId: userId, exchangeId: exchange.id },
                        read: false,
                    },
                    {
                        headers: {
                            "x-internal-token": process.env.INTERNAL_API_TOKEN,
                        },
                    }
                )
            );

        try {
            await Promise.all(notificationPayloads);
        } catch (error) {
            console.error(
                "Erreur envoi notifications aux participants:",
                error
            );
        }
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

    const previousParticipantIds = exchange.participants?.map((p) => p.userId);

    await Participants.destroy({ where: { exchangeId: exchange.id } });

    let validUserIds: string[] = [];

    if (participantIds.length > 0) {
        validUserIds = await validateParticipants(userId, participantIds);

        const newParticipants = validUserIds.map((participantId) => ({
            userId: participantId,
            exchangeId: exchange.id,
        }));

        await Participants.bulkCreate(newParticipants);

        const newOnly = validUserIds.filter(
            (id) => !previousParticipantIds?.includes(id) && id !== userId
        );

        const notificationPayloads = newOnly.map((participantId) =>
            axios.post(
                `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
                {
                    userId: participantId,
                    type: "exchange-invite",
                    data: { requesterId: userId, exchangeId: exchange.id },
                    read: false,
                },
                {
                    headers: {
                        "x-internal-token": process.env.INTERNAL_API_TOKEN,
                    },
                }
            )
        );

        try {
            await Promise.all(notificationPayloads);
        } catch (error) {
            console.error(
                "Erreur envoi notifications aux nouveaux participants:",
                error
            );
        }
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

    // todo : supprimer la photo de l'échange

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
                { id },
            ],
        },

        group: ["Exchange.id"],
    });

    return exchange;
};

export const searchExchangeByTitle = async (query: string, userId: string) => {
    const searchTerm = query.toLowerCase();

    const results = await Exchange.findAll({
        where: {
            [Op.and]: [
                Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("title")), {
                    [Op.like]: `%${searchTerm}%`,
                }),
                {
                    [Op.or]: [{ userId }, { "$participants.userId$": userId }],
                },
            ],
        },
        include: [
            {
                model: Participants,
                as: "participants",
                attributes: [],
                required: false,
            },
        ],
    });

    return results;
};

export const respondToExchange = async (
    userId: string,
    exchangeId: string,
    action: "accept" | "reject"
) => {
    const participant = await Participants.findOne({
        where: {
            userId,
            exchangeId,
        },
    });

    if (!participant) {
        throw new NotFoundError("Invitation à l'échange non trouvée.");
    }

    if (participant.acceptedAt) {
        throw new ValidationError("Invitation déjà acceptée.");
    }

    if (action === "accept") {
        participant.acceptedAt = new Date();
        await participant.save();
    } else if (action === "reject") {
        await participant.destroy();
    }

    // TODO : notifier de la réponse ?

    return participant;
};

export const drawExchangeService = async (
    userId: string,
    exchangeId: string
) => {
    const exchange = await Exchange.findByPk(exchangeId);

    if (!exchange) {
        throw new NotFoundError("Échange introuvable.");
    }

    if (exchange.userId !== userId) {
        throw new ConflictError("Seul le créateur peut lancer le tirage.");
    }

    const rulesAssoc = await ExchangeRulesAssoc.findAll({
        where: { exchangeId },
        include: [{ model: Rules, as: "rule" }],
    });
    const activeRules = rulesAssoc.map((assoc) => assoc.rule?.code);

    const participants = await Participants.findAll({
        where: {
            exchangeId,
            acceptedAt: { [Op.not]: null },
        },
    });

    if (participants.length < 3) {
        throw new ValidationError(
            "Au moins 3 participants doivent avoir accepté."
        );
    }

    const maxAttempts = 20;
    let assignments: {
        userId: string;
        assignedUserId: string;
        exchangeId: string;
    }[] = [];
    let success = false;

    for (let attempt = 0; attempt < maxAttempts && !success; attempt++) {
        const shuffled = shuffleArray([...participants]);
        const tempAssignments: typeof assignments = [];
        const assignedTargets = new Set<string>();

        success = true;

        for (let i = 0; i < shuffled.length; i++) {
            const giver = shuffled[i];
            const receiver = shuffled[(i + 1) % shuffled.length];

            if (
                activeRules.includes("no_self") &&
                giver.userId === receiver.userId
            ) {
                success = false;
                break;
            }

            if (
                activeRules.includes("no_double_target") &&
                assignedTargets.has(receiver.userId)
            ) {
                success = false;
                break;
            }

            if (activeRules.includes("no_repeat")) {
                const previous = await Assigned.findOne({
                    where: { userId: giver.userId },
                    order: [["createdAt", "DESC"]],
                });

                if (previous && previous.assignedUserId === receiver.userId) {
                    success = false;
                    break;
                }
            }

            assignedTargets.add(receiver.userId);
            tempAssignments.push({
                userId: giver.userId,
                assignedUserId: receiver.userId,
                exchangeId,
            });
        }

        if (!success) {
            throw new ValidationError(
                "Impossible de générer un tirage valide après plusieurs tentatives."
            );
        }
    }

    if (!success) {
        throw new ValidationError(
            "Impossible de générer un tirage valide après plusieurs tentatives."
        );
    }

    await Assigned.bulkCreate(assignments);
    // TODO : notifier les assignations
};

export const deleteExchangesByUserId = async (userId: string) => {
    const exchanges = await Exchange.findAll({
        where: {
            userId,
        },
    });

    if (!exchanges || exchanges.length === 0) {
        throw new NotFoundError("Aucun échange trouvé pour cet utilisateur.");
    }

    // todo : supprimer la photo de l'échange
    await Promise.all(exchanges.map((exchange) => exchange.destroy()));
};
