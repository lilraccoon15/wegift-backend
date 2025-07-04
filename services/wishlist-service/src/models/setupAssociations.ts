import Wishlist from "./Wishlist";
import Wish from "./Wish";
import Collaborators from "./Collaborators";

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
}

export { Wishlist, Wish };
