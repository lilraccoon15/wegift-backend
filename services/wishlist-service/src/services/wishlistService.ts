import { Wish, Wishlist } from "../models/setupAssociations";
import {
    AuthError,
    ConflictError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";
import axios from "axios";
import config from "../config";
import { Op, Sequelize } from "sequelize";
import Collaborators from "../models/Collaborators";

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

export const getAllUserWishlists = async (userId: string) => {
    const wishlists = await Wishlist.findAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
                },
                { access: "public" },
                { published: 1 },
            ],
        },
        attributes: [
            "id",
            "userId",
            "title",
            "picture",
            "description",
            "mode",
            [Sequelize.fn("COUNT", Sequelize.col("wishes.id")), "wishesCount"],
        ],
        include: [
            {
                model: Wish,
                as: "wishes",
                attributes: [],
                required: false,
            },
            {
                model: Collaborators,
                as: "collaborators",
                attributes: ["userId"],
                required: false,
            },
        ],
        group: ["Wishlist.id"],
    });
    return wishlists;
};

export const getAllMyWishlists = async (userId: string) => {
    const wishlists = await Wishlist.findAll({
        where: { [Op.or]: [{ userId }, { "$collaborators.userId$": userId }] },
        attributes: [
            "id",
            "userId",
            "title",
            "access",
            "picture",
            "description",
            "published",
            "mode",
            [Sequelize.fn("COUNT", Sequelize.col("wishes.id")), "wishesCount"],
        ],
        include: [
            {
                model: Wish,
                as: "wishes",
                attributes: [],
                required: false,
            },
            {
                model: Collaborators,
                as: "collaborators",
                attributes: ["userId"],
                required: false,
            },
        ],
        group: ["Wishlist.id"],
    });
    return wishlists;
};

export const getWishlistById = async (id: string, userId: string) => {
    const wishlist = await Wishlist.findOne({
        where: { id, userId },
        attributes: [
            "id",
            "userId",
            "title",
            "access",
            "picture",
            "description",
            "published",
            "mode",
        ],
        include: [{ model: Collaborators, as: "collaborators" }],
    });

    return wishlist;
};

export const getWishesByWishlistId = async (
    wishlistId: string,
    userId: string
) => {
    const wishes = await Wish.findAll({
        where: { wishlistId, userId },
        attributes: ["id", "title"],
    });
    return wishes;
};

export const findWishById = async (id: string, userId: string) => {
    const wish = await Wish.findOne({
        where: { id, userId },
        attributes: [
            "id",
            "wishlistId",
            "title",
            "description",
            "price",
            "link",
            "picture",
        ],
    });
    return wish;
};

export const createNewWishlist = async (
    userId: string,
    title: string,
    published: number = 1,
    access: string,
    mode: string,
    description?: string,
    picture?: string,
    participantIds: string[] = []
) => {
    const wishlist = await Wishlist.create({
        userId,
        title,
        description,
        picture,
        published,
        access,
        mode,
    });

    if (participantIds.length > 0) {
        const participantsData = participantIds.map((participantId) => ({
            userId: participantId,
            wishlistId: wishlist.id,
        }));
        await Collaborators.bulkCreate(participantsData);
    }

    await wishlist.reload({
        include: [{ model: Collaborators, as: "collaborators" }],
    });

    return wishlist;
};

export const modifyWishlistById = async (
    id: string,
    title: string,
    access: string,
    published: number,
    mode: string,
    description?: string,
    picture?: string,
    participantIds: string[] = []
) => {
    const wishlist = await Wishlist.findByPk(id);

    if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

    wishlist.title = title;
    if (description !== undefined) wishlist.description = description;
    if (picture !== undefined) wishlist.picture = picture;
    wishlist.mode = mode as "individual" | "collaborative";
    wishlist.access = access;
    wishlist.published = published;

    await wishlist.save();

    await Collaborators.destroy({ where: { wishlistId: wishlist.id } });

    if (participantIds.length > 0) {
        const collaboratorsData = participantIds.map((participantId) => ({
            userId: participantId,
            wishlistId: wishlist.id,
        }));
        await Collaborators.bulkCreate(collaboratorsData);
    }

    await wishlist.reload({
        include: [{ model: Collaborators, as: "collaborators" }],
    });

    return wishlist;
};

export const deleteWishlistById = async (id: string) => {
    const wishlist = await Wishlist.findByPk(id);

    if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

    await wishlist.destroy();
};

export const addNewWishToWishlist = async (
    title: string,
    wishlistId: string,
    description?: string,
    price?: number,
    link?: string,
    picture?: string
) => {
    const wish = await Wish.create({
        title,
        wishlistId,
        description,
        price,
        link,
        picture,
    });

    return wish;
};

export const modifyWishById = async (
    id: string,
    title: string,
    link?: string,
    price?: number,
    description?: string,
    picture?: string
) => {
    const wish = await Wish.findByPk(id);

    if (!wish) throw new NotFoundError("Wish non trouvée");

    wish.title = title;
    if (description !== undefined) wish.description = description;
    if (picture !== undefined) wish.picture = picture;
    if (link !== undefined) wish.link = link;
    if (price !== undefined) wish.price = price;

    await wish.save();

    return wish;
};

export const deleteWishById = async (id: string) => {
    const wish = await Wish.findByPk(id);

    if (!wish) throw new NotFoundError("Wish non trouvée");

    await wish.destroy();
};

export async function findProductsByQuery(
    query: string
): Promise<SearchResult[]> {
    const apiKey = config.googleApiKey;
    const cx = config.googleCseId;

    if (!apiKey || !cx) {
        throw new Error("Clé API Google ou ID moteur de recherche manquant.");
    }

    const url = `https://www.googleapis.com/customsearch/v1`;

    try {
        const response = await axios.get(url, {
            params: {
                q: query,
                key: apiKey,
                cx,
            },
        });

        if (!response.data.items) return [];

        return response.data.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        }));
    } catch (error) {
        console.error("Erreur lors de la recherche Google:", error);
        throw error;
    }
}

export const searchWishlistByTitle = async (query: string) => {
    const searchTerm = query.toLowerCase();

    const results = await Wishlist.findAll({
        where: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("title")), {
            [Op.like]: `%${searchTerm}%`,
        }),
    });

    return results;
};

export const leaveWishlistAsCollaborator = async (
    wishlistId: string,
    userId: string
) => {
    const wishlist = await Wishlist.findByPk(wishlistId, {
        include: [{ model: Collaborators, as: "collaborators" }],
    });

    if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

    const isCollaborator = wishlist.collaborators?.some(
        (c) => c.userId === userId
    );

    if (!isCollaborator)
        throw new AuthError("Vous n’êtes pas collaborateur de cette wishlist.");

    await Collaborators.destroy({
        where: { userId, wishlistId },
    });
};

export const subscribeToWishlistService = async (
    userId: string,
    wishlistId: string
) => {
    const wishlist = await Wishlist.findOne({
        where: { id: wishlistId, access: "public", published: 1 },
    });

    if (!wishlist) {
        throw new NotFoundError("Wishlist non trouvée ou non accessible.");
    }

    if (wishlist.userId === userId) {
        throw new ValidationError(
            "Vous êtes déjà propriétaire de cette wishlist."
        );
    }

    const alreadyCollaborator = await Collaborators.findOne({
        where: { userId, wishlistId },
    });

    if (alreadyCollaborator) {
        throw new ConflictError("Vous êtes déjà abonné à cette wishlist.");
    }

    const newCollab = await Collaborators.create({ userId, wishlistId });

    return newCollab;
};

export const unsubscribeFromWishlistService = async (userId: string, wishlistId: string) => {
    const wishlist = await Wishlist.findByPk(wishlistId);

    if (!wishlist) {
        throw new NotFoundError("Wishlist non trouvée.");
    }

    if (wishlist.userId === userId) {
        throw new ValidationError("Vous êtes propriétaire de cette wishlist.");
    }

    const collaborator = await Collaborators.findOne({
        where: { userId, wishlistId },
    });

    if (!collaborator) {
        throw new NotFoundError("Vous n'êtes pas collaborateur de cette wishlist.");
    }

    await collaborator.destroy();

    return { success: true };
};