import { QueryInterface, DataTypes } from "sequelize";

export default {
    async up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.addColumn("users", "lastLoginAt", {
            type: DataTypes.DATE,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "languagePreference", {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "fr",
        });

        await queryInterface.addColumn("users", "isSuspended", {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.removeColumn("users", "isSuspended");
        await queryInterface.removeColumn("users", "languagePreference");
        await queryInterface.removeColumn("users", "lastLoginAt");
    },
};
