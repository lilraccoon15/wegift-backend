import Wishlist from "./Wishlist";
import Wish from "./Wish";
import Collaborators from "./Collaborators";
import Subscriber from "./Subscribers";
import WishReservation from "./WishReservation";

export default function setupAssociations() {
  Wishlist.hasMany(Wish, {
    foreignKey: "wishlistId",
    as: "wishes",
  });

  Wish.belongsTo(Wishlist, {
    foreignKey: "wishlistId",
    as: "wishlist",
  });

  Wishlist.hasMany(Collaborators, {
    foreignKey: "wishlistId",
    as: "collaborators",
  });
  Collaborators.belongsTo(Wishlist, {
    foreignKey: "wishlistId",
    as: "wishlist",
  });

  Wishlist.hasMany(Subscriber, {
    foreignKey: "wishlistId",
    as: "subscribers",
  });
  Subscriber.belongsTo(Wishlist, { foreignKey: "wishlistId" });

  Wish.hasOne(WishReservation, {
    foreignKey: "wishId",
    as: "reservation",
    onDelete: "CASCADE",
  });

  WishReservation.belongsTo(Wish, {
    foreignKey: "wishId",
    as: "wish",
  });
}

export { Wishlist, Wish, Subscriber };
