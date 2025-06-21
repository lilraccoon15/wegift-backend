import Wish from "../models/Wish";
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

export const createNewWish = async (
    title: string,
    wishlistId: string,
    description?: string,
    price?: number,
    link?: string,
    picture?: string,
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
}

export const updateWishService = async (
    id: string,
    title: string,
    link?: string,
    price?: number,
    description?: string,
    picture?: string,
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
}

export const deleteWishService = async (
    id: string,
) => {
    const wish = await Wish.findByPk(id);

    if (!wish) throw new NotFoundError("Wish non trouvée");

    await wish.destroy();
}