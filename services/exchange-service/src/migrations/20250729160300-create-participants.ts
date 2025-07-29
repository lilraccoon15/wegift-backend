import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("participants", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      exchangeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      invitedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("participants", ["userId", "exchangeId"], {
      unique: true,
      name: "participants_user_exchange_unique_idx",
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable("participants");
  },
};
