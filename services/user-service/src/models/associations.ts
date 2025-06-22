import UserProfile from "./UserProfile";
import Friendship from "./Friendship";

Friendship.belongsTo(UserProfile, { foreignKey: "requesterId", as: "requester" });
Friendship.belongsTo(UserProfile, { foreignKey: "addresseeId", as: "addressee" });

export { UserProfile, Friendship };
