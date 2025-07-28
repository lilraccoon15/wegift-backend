import { Subscriber, Wish, Wishlist } from "../models/setupAssociations";
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
import { tryDeleteLocalImage } from "../utils/files";
import WishReservation from "../models/WishReservation";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: string | null;
  price?: number | null;
}

export async function canAccessWishlist(
  userId: string,
  wishlistId: string,
  isAdmin = false
) {
  if (isAdmin) {
    return Wishlist.findByPk(wishlistId);
  }

  return Wishlist.findOne({
    where: {
      id: wishlistId,
      [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
    },
    include: [{ model: Collaborators, as: "collaborators", attributes: [] }],
  });
}

export const getAllUserWishlists = async (
  targetUserId: string,
  currentUserRole: string,
  currentUserId: string
) => {
  const isAdmin = currentUserRole === "admin";

  const whereClause = isAdmin
    ? { userId: targetUserId }
    : {
        [Op.and]: [
          { userId: targetUserId },
          {
            [Op.or]: [
              {
                [Op.and]: [{ access: "public" }, { published: 1 }],
              },
              Sequelize.literal(`EXISTS (
                SELECT 1 FROM collaborators 
                WHERE collaborators.wishlistId = Wishlist.id 
                AND collaborators.userId = '${currentUserId}'
              )`),
            ],
          },
        ],
      };

  const wishlists = await Wishlist.findAll({
    where: whereClause,
    attributes: ["id", "userId", "title", "picture", "description", "mode"],
    include: [
      {
        model: Wish,
        as: "wishes",
        attributes: ["id"],
        required: false,
      },
      {
        model: Collaborators,
        as: "collaborators",
        attributes: ["userId"],
        required: false,
      },
    ],
  });

  return wishlists.map((w) => {
    const wJson = w.toJSON() as any;
    wJson.wishesCount = wJson.wishes?.length ?? 0;
    return wJson;
  });
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
    group: ["Wishlist.id", "collaborators.userId"],
  });
  return wishlists;
};

export const getMyWishlistById = async (id: string, userId: string) => {
  const wishlist = await Wishlist.findOne({
    where: {
      id,
      [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
    },
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
    include: [
      { model: Collaborators, as: "collaborators" },
      { model: Subscriber, as: "subscribers" },
    ],
  });

  return wishlist;
};

export const getWishlistById = async (id: string, userId: string) => {
  const wishlist = await Wishlist.findOne({
    where: {
      id,
    },
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

  if (
    !wishlist?.published &&
    wishlist?.access !== "public" &&
    wishlist?.userId !== userId
  ) {
    throw new AuthError("Accès non autorisé à cette wishlist");
  }

  return wishlist;
};

export const getMyWishesByWishlistId = async (
  wishlistId: string,
  userId: string
) => {
  const wishlist = await Wishlist.findOne({
    where: {
      id: wishlistId,
      [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
    },
    include: [{ model: Collaborators, as: "collaborators", attributes: [] }],
  });

  if (!wishlist) throw new NotFoundError("Accès interdit à cette wishlist");

  const wishes = await Wish.findAll({
    where: { wishlistId },
    attributes: ["id", "title", "picture"],
  });
  return wishes;
};

export const getWishesByWishlistId = async (
  wishlistId: string,
  userId: string
) => {
  const wishlist = await Wishlist.findOne({
    where: {
      id: wishlistId,
    },
    include: [{ model: Collaborators, as: "collaborators", attributes: [] }],
  });

  if (!wishlist) throw new NotFoundError("Accès interdit à cette wishlist");

  if (
    !wishlist.published &&
    wishlist.access !== "public" &&
    wishlist.userId !== userId
  ) {
    throw new AuthError("Accès non autorisé à cette wishlist");
  }

  const wishes = await Wish.findAll({
    where: { wishlistId },
    attributes: ["id", "title", "picture"],
  });
  return wishes;
};

export const findMyWishById = async (id: string, userId: string) => {
  const wish = await Wish.findByPk(id);
  if (!wish) return null;

  const wishlist = await Wishlist.findOne({
    where: {
      id: wish.wishlistId,
      [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
    },
    include: [{ model: Collaborators, as: "collaborators", attributes: [] }],
  });

  if (!wishlist) throw new AuthError("Accès non autorisé à ce souhait");

  return wish;
};

export const findWishById = async (id: string, userId: string) => {
  const wish = await Wish.findByPk(id, {
    include: [
      {
        model: WishReservation,
        as: "reservation",
        where: { userId },
        required: false,
        attributes: ["id", "isAnonymous", "userId"], // ou tous
      },
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
  userId: string,
  title?: string,
  access?: string,
  published?: number,
  mode?: string,
  description?: string,
  picture?: string,
  participantIds: string[] = []
) => {
  const wishlist = await Wishlist.findByPk(id);

  if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

  if (wishlist.userId !== userId) {
    throw new AuthError("Vous n’êtes pas autorisé à modifier cette wishlist");
  }

  if (title !== undefined) wishlist.title = title;
  if (description !== undefined) wishlist.description = description;
  if (picture !== undefined) wishlist.picture = picture;
  if (access !== undefined) wishlist.access = access;
  if (published !== undefined) wishlist.published = published;
  if (mode !== undefined)
    wishlist.mode = mode as "individual" | "collaborative";

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

export const deleteWishlistById = async (id: string, userId: string) => {
  const wishlist = await Wishlist.findByPk(id);

  if (!wishlist) throw new NotFoundError("Wishlist non trouvée");

  if (wishlist.userId !== userId) {
    throw new AuthError("Vous n’êtes pas autorisé à supprimer cette wishlist");
  }

  const wishes = await Wish.findAll({ where: { wishlistId: wishlist.id } });

  if (wishlist.picture && !wishlist.picture.startsWith("http")) {
    tryDeleteLocalImage(wishlist.picture, "wishlistPictures");
  }

  for (const wish of wishes) {
    tryDeleteLocalImage(wish.picture, "wishPictures");
  }
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

  try {
    const subscribers = await Subscriber.findAll({
      where: { wishlistId },
    });

    await Promise.all(
      subscribers.map((subscriber) =>
        axios
          .post(
            `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
            {
              userId: subscriber.userId,
              type: "wishlist-new-wish",
              data: {
                wishlistId,
                wishTitle: title,
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
              `Erreur notif utilisateur ${subscriber.userId} :`,
              error
            )
          )
      )
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications :", error);
  }

  return wish;
};

export const modifyWishById = async (
  id: string,
  userId: string,
  title?: string,
  link?: string,
  price?: number,
  description?: string,
  picture?: string
) => {
  const wish = await Wish.findByPk(id);

  if (!wish) throw new NotFoundError("Wish non trouvé");

  const wishlist = await Wishlist.findOne({
    where: {
      id: wish.wishlistId,
      [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
    },
    include: [{ model: Collaborators, as: "collaborators", attributes: [] }],
  });

  if (!wishlist) throw new AuthError("Accès non autorisé à ce souhait");

  if (title !== undefined) wish.title = title;
  if (description !== undefined) wish.description = description;
  if (picture !== undefined) wish.picture = picture;
  if (link !== undefined) wish.link = link;
  if (price !== undefined) wish.price = price;

  await wish.save();

  return wish;
};

export const deleteWishById = async (id: string, userId: string) => {
  const wish = await Wish.findByPk(id);

  if (!wish) throw new NotFoundError("Wish non trouvée");

  const wishlist = await Wishlist.findOne({
    where: {
      id: wish.wishlistId,
      [Op.or]: [{ userId }, { "$collaborators.userId$": userId }],
    },
    include: [{ model: Collaborators, as: "collaborators", attributes: [] }],
  });

  if (!wishlist) throw new AuthError("Accès non autorisé à ce souhait");

  if (wish.picture && !wish.picture.startsWith("http")) {
    tryDeleteLocalImage(wish.picture, "wishPictures");
  }

  await wish.destroy();
};

export async function findProductsByQuery(
  url: string,
  wishlistId: string
): Promise<SearchResult[]> {
  const apiKey = config.googleApiKey;
  const cx = config.googleCseId;

  if (!apiKey || !cx) {
    throw new Error("Clé API Google ou ID moteur de recherche manquant.");
  }

  const api = `https://www.googleapis.com/customsearch/v1`;

  try {
    const response = await axios.get(api, {
      params: {
        q: url,
        key: apiKey,
        cx,
      },
    });

    if (!response.data.items) return [];

    return response.data.items.map((item: any) => {
      const image = item.pagemap?.cse_image?.[0]?.src ?? null;

      const priceMatch =
        item.snippet?.match(/(\d+)[\s]*€/) ||
        item.snippet?.match(/€[\s]*(\d+)/);

      const price = priceMatch ? parseInt(priceMatch[1], 10) : null;

      return {
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image,
        price,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la recherche Google:", error);
    throw error;
  }
}

export const searchWishlistByTitle = async (
  query: string,
  currentUserId: string,
  currentUserRole: string
) => {
  const isAdmin = currentUserRole === "admin";
  const searchTerm = query.toLowerCase();

  const baseTitleCondition = Sequelize.where(
    Sequelize.fn("LOWER", Sequelize.col("Wishlist.title")),
    {
      [Op.like]: `%${searchTerm}%`,
    }
  );

  const accessCondition = {
    [Op.or]: [
      {
        [Op.and]: [{ access: "public" }, { published: 1 }],
      },
      { userId: currentUserId },
      { "$collaborators.userId$": currentUserId },
    ],
  };

  const whereClause = {
    [Op.and]: [baseTitleCondition, ...(isAdmin ? [] : [accessCondition])],
  };

  const results = await Wishlist.findAll({
    where: whereClause,
    include: [
      {
        model: Collaborators,
        as: "collaborators",
        attributes: [],
        required: false,
      },
      {
        model: Wish,
        as: "wishes",
        attributes: [],
        required: false,
      },
    ],
    attributes: [
      "id",
      "userId",
      "title",
      "picture",
      "description",
      "mode",
      [Sequelize.fn("COUNT", Sequelize.col("wishes.id")), "wishesCount"],
    ],
    group: ["Wishlist.id"],
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
    throw new ValidationError("Vous êtes déjà propriétaire de cette wishlist.");
  }

  const newSub = await Subscriber.create({ userId, wishlistId });

  try {
    await axios.post(
      `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
      {
        userId: wishlist.userId,
        type: "wishlist-sub",
        data: { from: userId },
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

  return newSub;
};

export const unsubscribeFromWishlistService = async (
  userId: string,
  wishlistId: string,
  targetUserId?: string
) => {
  const wishlist = await Wishlist.findByPk(wishlistId);

  if (!wishlist) {
    throw new NotFoundError("Wishlist non trouvée.");
  }

  // Si on essaie de désabonner quelqu’un d’autre que soi
  const isOwnerRemovingSomeone = !!targetUserId;

  if (isOwnerRemovingSomeone && wishlist.userId !== userId) {
    throw new AuthError("Seul le propriétaire peut retirer un abonné.");
  }

  const subscriberId = targetUserId ?? userId;

  if (subscriberId === wishlist.userId) {
    throw new ValidationError("Le propriétaire ne peut pas être désabonné.");
  }

  const subscription = await Subscriber.findOne({
    where: { userId: subscriberId, wishlistId },
  });

  if (!subscription) {
    throw new NotFoundError(
      isOwnerRemovingSomeone
        ? "L'utilisateur ciblé n'est pas abonné à cette wishlist."
        : "Vous n'êtes pas abonné à cette wishlist."
    );
  }

  await subscription.destroy();

  return { success: true };
};

export const deleteWishlistsByUserId = async (userId: string) => {
  const wishlists = await Wishlist.findAll({
    where: {
      userId,
    },
  });

  if (!wishlists || wishlists.length === 0) {
    throw new NotFoundError("Aucune liste trouvée pour cet utilisateur.");
  }

  const allWishes: Wish[] = [];

  for (const wishlist of wishlists) {
    tryDeleteLocalImage(wishlist.picture, "wishlistPictures");

    const wishes = await Wish.findAll({
      where: { wishlistId: wishlist.id },
    });
    allWishes.push(...wishes);
  }

  for (const wish of allWishes) {
    tryDeleteLocalImage(wish.picture, "wishPictures");
  }

  await Promise.all(wishlists.map((wishlist) => wishlist.destroy()));
};

export const reserveWishService = async (
  wishId: string,
  userId: string,
  isAnonymous: boolean
) => {
  const wish = await Wish.findByPk(wishId);
  if (!wish) throw new NotFoundError("Souhait non trouvé");

  if (wish.status === "reserved") {
    throw new ConflictError("Ce souhait est déjà réservé");
  }

  await WishReservation.create({
    wishId,
    userId,
    isAnonymous,
  });

  wish.status = "reserved";
  await wish.save();

  return wish;
};

export const cancelReservationService = async (
  wishId: string,
  userId: string
) => {
  const wish = await Wish.findByPk(wishId);
  if (!wish) throw new NotFoundError("Souhait non trouvé");

  const reservation = await WishReservation.findOne({
    where: { wishId, userId },
  });

  if (!reservation) {
    throw new ConflictError("Aucune réservation trouvée pour ce souhait");
  }

  await reservation.destroy();

  wish.status = "available";
  await wish.save();

  return wish;
};

export const getReservedWishesByUser = async (userId: string) => {
  const reservations = await WishReservation.findAll({
    where: { userId },
    include: [
      {
        model: Wish,
        as: "wish",
        required: true,
      },
    ],
  });

  return reservations
    .filter((r) => r.wish) // sécurité au cas où
    .map((r) => ({
      wish: r.wish,
      reservation: {
        id: r.id,
        wishId: r.wishId,
        userId: r.userId,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt,
      },
    }));
};
