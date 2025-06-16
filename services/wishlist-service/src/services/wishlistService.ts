import { NotFoundError } from "../errors/CustomErrors";
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

export const updateWishlistService = async (
    id: string,
    title: string,
    access: string,
    published: number,
    description?: string,
    picture?: string,
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
}

export const deleteWishlistService = async (
    id: string,
) => {
    const wishlist = await Wishlist.findByPk(id);

    if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

    await wishlist.destroy();
}