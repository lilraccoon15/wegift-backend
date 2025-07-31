import { QueryInterface, Sequelize } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(
    queryInterface: QueryInterface,
    Sequelize: typeof import("sequelize")
  ) {
    await queryInterface.changeColumn("wishes", "price", {
      type: Sequelize.FLOAT,
      allowNull: true, // ou false si c'était déjà NOT NULL
    });
  },

  async down(
    queryInterface: QueryInterface,
    Sequelize: typeof import("sequelize")
  ) {
    await queryInterface.changeColumn("wishes", "price", {
      type: Sequelize.INTEGER,
      allowNull: true, // ou false selon l’état initial
    });
  },
};
