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
    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName} 
      ALTER COLUMN ${enumColumnName} 
      TYPE VARCHAR(255);
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS ${enumName};
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE ${enumName} AS ENUM (${newEnumValues
      .map((val) => `'${val}'`)
      .join(", ")});
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName} 
      ALTER COLUMN ${enumColumnName} 
      TYPE ${enumName} 
      USING (${enumColumnName}::text::${enumName});
    `);
  },

  async down(queryInterface: QueryInterface) {
    const oldEnumValues = ["friendship", "wishlist", "exchange"];

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      ALTER COLUMN ${enumColumnName}
      TYPE VARCHAR(255);
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS ${enumName};
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE ${enumName} AS ENUM (${oldEnumValues
      .map((val) => `'${val}'`)
      .join(", ")});
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE ${tableName}
      ALTER COLUMN ${enumColumnName}
      TYPE ${enumName}
      USING (${enumColumnName}::text::${enumName});
    `);
  },
};
