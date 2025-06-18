import UserProfile from "./UserProfile";
import Friendship from "./Friendship";

Friendship.belongsTo(UserProfile, { foreignKey: "userId1", as: "user1" });
Friendship.belongsTo(UserProfile, { foreignKey: "userId2", as: "user2" });

export { UserProfile, Friendship };
