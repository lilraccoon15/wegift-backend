import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("collaborators", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      wishlistId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("collaborators", {
      fields: ["userId", "wishlistId"],
      type: "unique",
      name: "unique_user_wishlist_collaborator",
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable("collaborators");
  },
};
