import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("notifications_types", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("friendship", "wishlist", "exchange"),
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable("notifications_types");
  },
};
