import { Op, Sequelize } from "sequelize";
import {
    Assigned,
    Exchange,
    Participants,
    Rules,
    ExchangeRulesAssoc,
} from "../models/setupAssociations";
import {
    AuthError,
    ConflictError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";
import { shuffleArray } from "../utils/shuffleArray";
import { validateParticipants } from "../utils/validateParticipants";
import axios from "axios";
import config from "../config";
import { tryDeleteLocalImage } from "../utils/files";

export const getAllMyExchanges = async (userId: string) => {
    const exchanges = await Exchange.findAll({
        attributes: [
            "id",
            "userId",
            "title",
            "picture",
            "description",
            "startDate",
            "endDate",
            [
                Sequelize.fn(
                    "COUNT",
                    Sequelize.literal(
                        `CASE WHEN participants.acceptedAt IS NOT NULL THEN 1 END`
                    )
                ),
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

export const getAllUserExchanges = async (userId: string, userRole: string) => {
    const isAdmin = userRole === "admin";
    const exchanges = await Exchange.findAll({
        attributes: [
            "id",
            "userId",
            "title",
            "picture",
            "description",
            "startDate",
            "endDate",
            [
                Sequelize.fn(
                    "COUNT",
                    Sequelize.literal(
                        `CASE WHEN participants.acceptedAt IS NOT NULL THEN 1 END`
                    )
                ),
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
        where: isAdmin
            ? undefined
            : {
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
                        data: {
                            requesterId: userId,
                            exchangeId: exchange.id,
                            exchangePicture: exchange.picture,
                            exchangeTitle: exchange.title,
                        },
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
    endDate: Date,
    startDate: Date,
    description?: string,
    picture?: string,
    budget?: number,
    participantIds: string[] = [],
    ruleIds: string[] = [],
    userRole?: string
) => {
    const isAdmin = userRole === "admin";
    const exchange = await Exchange.findByPk(id, {
        include: [
            { model: Participants, as: "participants" },
            { model: Rules, as: "rules" },
        ],
    });

    if (!exchange) throw new NotFoundError("Échange non trouvé");

    if (exchange.userId !== userId && !isAdmin) {
        throw new Error("Accès refusé à cet échange.");
    }

    exchange.title = title;
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
                    data: {
                        requesterId: userId,
                        exchangeId: exchange.id,
                        exchangePicture: exchange.picture,
                        exchangeTitle: exchange.title,
                    },
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

export const deleteExchangeById = async (id: string, userId: string) => {
    const exchange = await Exchange.findByPk(id);

    if (!exchange) throw new NotFoundError("Echange non trouvé");

    if (exchange.userId !== userId) {
        throw new AuthError("Vous n'êtes pas autorisé à supprimer cet échange");
    }

    if (exchange.picture && !exchange.picture.startsWith("http")) {
        tryDeleteLocalImage(exchange.picture, "exchangePictures");
    }

    await exchange.destroy();
};

export const getExchangeById = async (
    id: string,
    userId: string,
    userRole?: string
) => {
    const isAdmin = userRole === "admin";

    const exchange = await Exchange.findOne({
        attributes: [
            "id",
            "userId",
            "title",
            "picture",
            "description",
            "startDate",
            "endDate",
        ],
        include: [
            {
                model: Participants,
                as: "participants",
                attributes: ["id", "userId", "acceptedAt"],
                required: false,
            },
            {
                model: Assigned,
                as: "assigned",
                attributes: ["userId", "assignedUserId"],
                required: false,
            },
        ],
        where: { id },
        subQuery: false,
    });

    if (!exchange) return null;

    const exchangeJson = exchange.toJSON() as any;

    const isParticipant =
        exchangeJson.userId === userId ||
        exchangeJson.participants?.some((p: any) => p.userId === userId);

    if (!isAdmin && !isParticipant) return null;

    exchangeJson.participantsCount =
        exchangeJson.participants?.filter((p: any) => p.acceptedAt !== null)
            .length ?? 0;

    return exchangeJson;
};

export const searchExchangeByTitle = async (
    query: string,
    userId: string,
    userRole: string
) => {
    const isAdmin = userRole === "admin";
    const searchTerm = query.toLowerCase();

    const baseTitleCondition = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("title")),
        {
            [Op.like]: `%${searchTerm}%`,
        }
    );

    const whereClause = isAdmin
        ? baseTitleCondition
        : {
              [Op.and]: [
                  baseTitleCondition,
                  {
                      [Op.or]: [
                          { userId },
                          { "$participants.userId$": userId },
                      ],
                  },
              ],
          };

    const results = await Exchange.findAll({
        where: whereClause,
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

    let notificationType: "exchange-accept" | "exchange-reject" | null = null;

    if (action === "accept") {
        participant.acceptedAt = new Date();
        await participant.save();
        notificationType = "exchange-accept";
    } else if (action === "reject") {
        await participant.destroy();
        notificationType = "exchange-reject";
    }

    try {
        const exchange = await Exchange.findByPk(exchangeId);
        if (!exchange) throw new NotFoundError("Échange introuvable.");

        await axios.post(
            `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
            {
                userId: exchange.userId,
                type: notificationType,
                data: {
                    from: userId,
                    exchangeId: exchange.id,
                    exchangePicture: exchange.picture,
                    exchangeTitle: exchange.title,
                },
                read: false,
            },
            {
                headers: {
                    "x-internal-token": process.env.INTERNAL_API_TOKEN,
                },
            }
        );
    } catch (error) {
        console.error("Erreur envoi notification:", error);
    }

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

    const activeRules = rulesAssoc
        .map((assoc) => assoc.rule?.code)
        .filter((code) => code === "no_repeat" || code === "no_mutual_assign");

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

            // Règles de base (toujours actives)
            if (giver.userId === receiver.userId) {
                success = false;
                break;
            }

            if (assignedTargets.has(receiver.userId)) {
                success = false;
                break;
            }

            // Règle : pas la même personne que l'année précédente
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

            // Règle : pas d’attribution mutuelle
            if (activeRules.includes("no_mutual_assign")) {
                const reverse = tempAssignments.find(
                    (a) =>
                        a.userId === receiver.userId &&
                        a.assignedUserId === giver.userId
                );

                if (reverse) {
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

        if (success) {
            assignments = tempAssignments;
        }
    }

    if (!success || assignments.length === 0) {
        throw new ValidationError(
            "Impossible de générer un tirage valide après plusieurs tentatives."
        );
    }

    await Assigned.bulkCreate(assignments);

    await Promise.all(
        assignments.map((assignment) =>
            axios
                .post(
                    `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
                    {
                        userId: assignment.userId,
                        type: "exchange-assign",
                        data: {
                            assignedUserId: assignment.assignedUserId,
                            exchangeId: exchange.id,
                            exchangePicture: exchange.picture,
                            exchangeTitle: exchange.title,
                        },
                        read: false,
                    },
                    {
                        headers: {
                            "x-internal-token": process.env.INTERNAL_API_TOKEN,
                        },
                    }
                )
                .catch((error) =>
                    console.error(
                        `Erreur notif utilisateur ${assignment.userId} :`,
                        error
                    )
                )
        )
    );
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

    for (const exchange of exchanges) {
        tryDeleteLocalImage(exchange.picture, "exchangePictures");
    }
    await Promise.all(exchanges.map((exchange) => exchange.destroy()));
};

export const cancelDrawExchangeService = async (
    exchangeId: string,
    userId: string
): Promise<boolean> => {
    const exchange = await Exchange.findByPk(exchangeId);

    if (!exchange) return false;
    if (exchange.userId !== userId) return false;

    await Assigned.destroy({
        where: { exchangeId },
    });

    return true;
};
