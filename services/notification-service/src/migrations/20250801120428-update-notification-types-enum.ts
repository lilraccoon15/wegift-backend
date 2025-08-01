import { QueryInterface } from "sequelize";

const tableName = "notifications_types";
const enumColumnName = "type";
const enumName = "enum_notifications_types_type";

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
    // Changer temporairement en VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${enumColumnName} VARCHAR(255);
    `);

    // Supprimer l'ancien ENUM (si existant)
    await queryInterface.sequelize
      .query(
        `
      DROP TYPE IF EXISTS ${enumName};
    `
      )
      .catch(() => {}); // ignore erreur si non supporté

    // Créer le nouvel ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${enumColumnName} ENUM(${newEnumValues
      .map((val) => `'${val}'`)
      .join(", ")}) NOT NULL;
    `);
  },

  async down(queryInterface: QueryInterface) {
    const oldEnumValues = ["friendship", "wishlist", "exchange"];

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${enumColumnName} VARCHAR(255);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      MODIFY COLUMN ${enumColumnName} ENUM(${oldEnumValues
      .map((val) => `'${val}'`)
      .join(", ")}) NOT NULL;
    `);
  },
};
