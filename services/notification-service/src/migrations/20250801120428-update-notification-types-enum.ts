import { QueryInterface } from "sequelize";

const tableName = "notifications_types";
const columnName = "type";

const newEnumValues = [
  "friendship",
  "friendship-accept",
  "wishlist",
  "wishlist-new-wish",
  "wishlist-sub",
  "exchange-invite",
  "exchange-accept",
  "exchange-reject",
  "exchange-assign",
];

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Étape 1 : Changer le type en VARCHAR pour pouvoir modifier le ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${columnName} VARCHAR(255) NOT NULL;
    `);

    // Étape 2 : Remettre le ENUM avec les nouvelles valeurs
    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${columnName} ENUM(${newEnumValues
      .map((val) => `'${val}'`)
      .join(", ")}) NOT NULL;
    `);
  },

  async down(queryInterface: QueryInterface) {
    const oldEnumValues = ["friendship", "wishlist", "exchange"];

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${columnName} VARCHAR(255) NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${columnName} ENUM(${oldEnumValues
      .map((val) => `'${val}'`)
      .join(", ")}) NOT NULL;
    `);
  },
};
