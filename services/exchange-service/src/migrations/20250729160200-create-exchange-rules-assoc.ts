import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("exchange_rules_assoc", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      exchangeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      ruleId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      "exchange_rules_assoc",
      ["exchangeId", "ruleId"],
      {
        unique: true,
        name: "exchange_rule_unique_idx",
      }
    );
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable("exchange_rules_assoc");
  },
};
