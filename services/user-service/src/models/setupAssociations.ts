import UserProfile from "./UserProfile";
import Friendship from "./Friendship";

export default function setupAssociations() {
  Friendship.belongsTo(UserProfile, {
    foreignKey: "requesterId",
    as: "requester",
  });
  Friendship.belongsTo(UserProfile, {
    foreignKey: "addresseeId",
    as: "addressee",
  });

  UserProfile.hasMany(Friendship, {
    foreignKey: "requesterId",
    as: "sentFriendships",
  });
  UserProfile.hasMany(Friendship, {
    foreignKey: "addresseeId",
    as: "receivedFriendships",
  });
}

export { UserProfile, Friendship };
