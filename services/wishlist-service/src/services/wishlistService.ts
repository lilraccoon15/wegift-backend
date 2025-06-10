import Wishlist from "../models/Wishlist";

export const createWishlistService = async (
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
