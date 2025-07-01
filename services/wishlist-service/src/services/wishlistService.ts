import { Wish, Wishlist } from "../models/setupAssociations";
import { NotFoundError } from "../errors/CustomErrors";
import axios from "axios";
import config from "../config";
import { Sequelize } from "sequelize";

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

export const getAllUserWishlists = async (userId: string) => {
    const wishlists = await Wishlist.findAll({
        where: { userId },
        attributes: [
            "id",
            "userId",
            "title",
            "access",
            "picture",
            "description",
            "published",
            [Sequelize.fn("COUNT", Sequelize.col("wishes.id")), "wishesCount"],
        ],
        include: [
            {
                model: Wish,
                as: "wishes",
                attributes: [],
                required: false,
            },
        ],
        group: ["Wishlist.id"],
    });
    return wishlists;
};

export const getWishlistById = async (id: string) => {
    const wishlist = await Wishlist.findOne({
        where: { id },
        attributes: [
            "id",
            "userId",
            "title",
            "access",
            "picture",
            "description",
            "published",
        ],
    });

    return wishlist;
};

export const getWishesByWishlistId = async (wishlistId: string) => {
    const wishes = await Wish.findAll({
        where: { wishlistId },
        attributes: ["id", "title"],
    });
    return wishes;
};

export const findWishById = async (id: string) => {
    const wish = await Wish.findOne({
        where: { id },
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
    description?: string,
    picture?: string
) => {
    const wishlist = await Wishlist.create({
        userId,
        title,
        description,
        picture,
        published,
        access,
    });

    return wishlist;
};

export const modifyWishlistById = async (
    id: string,
    title: string,
    access: string,
    published: number,
    description?: string,
    picture?: string
) => {
    const wishlist = await Wishlist.findByPk(id);

    if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

    wishlist.title = title;
    if (description !== undefined) wishlist.description = description;
    if (picture !== undefined) wishlist.picture = picture;
    wishlist.access = access;
    wishlist.published = published;

    await wishlist.save();

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
