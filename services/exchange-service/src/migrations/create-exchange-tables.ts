import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    // Table exchange
    await queryInterface.createTable("exchange", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });

    // Table rules
    await queryInterface.createTable("rules", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });

    // Table participants
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
      name: "participants_user_exchange_unique",
    });

    // Table assigned
    await queryInterface.createTable("assigned", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      assignedUserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      exchangeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    });

    // Table exchange_rules_assoc
    await queryInterface.createTable("exchange_rules_assoc", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
        name: "exchange_rule_unique",
      }
    );
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable("exchange_rules_assoc");
    await queryInterface.dropTable("assigned");
    await queryInterface.removeIndex(
      "participants",
      "participants_user_exchange_unique"
    );
    await queryInterface.dropTable("participants");
    await queryInterface.dropTable("rules");
    await queryInterface.dropTable("exchange");
  },
};
