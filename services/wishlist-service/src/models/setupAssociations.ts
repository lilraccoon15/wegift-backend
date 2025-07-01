import Wishlist from "./Wishlist";
import Wish from "./Wish";

export default function setupAssociations() {
    Wishlist.hasMany(Wish, {
        foreignKey: "wishlistId",
        as: "wishes",
    });

    Wish.belongsTo(Wishlist, {
        foreignKey: "wishlistId",
        as: "wishlist",
    });
}

export { Wishlist, Wish };
