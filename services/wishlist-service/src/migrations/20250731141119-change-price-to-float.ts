import { QueryInterface, Sequelize } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(
        queryInterface: QueryInterface,
        Sequelize: typeof import("sequelize")
    ) {
        await queryInterface.changeColumn("wishes", "price", {
            type: Sequelize.FLOAT,
            allowNull: true,
        });
    },

    async down(
        queryInterface: QueryInterface,
        Sequelize: typeof import("sequelize")
    ) {
        await queryInterface.changeColumn("wishes", "price", {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
