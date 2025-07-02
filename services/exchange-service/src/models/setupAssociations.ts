import Exchange from "./Exchange";
import Participants from "./Participants";
import Assigned from "./Assigned";
import Rules from "./Rules";
import ExchangeRulesAssoc from "./ExchangeRulesAssoc";

export default function setupAssociations() {
    Exchange.hasMany(Participants, {
        foreignKey: "exchangeId",
        as: "participants",
    });
    Participants.belongsTo(Exchange, {
        foreignKey: "exchangeId",
        as: "exchange",
    });

    Exchange.hasMany(Assigned, {
        foreignKey: "exchangeId",
        as: "assignedUsers",
    });
    Assigned.belongsTo(Exchange, { foreignKey: "exchangeId", as: "exchange" });

    Exchange.belongsToMany(Rules, {
        through: ExchangeRulesAssoc,
        foreignKey: "exchangeId",
        otherKey: "ruleId",
        as: "rules",
    });
    Rules.belongsToMany(Exchange, {
        through: ExchangeRulesAssoc,
        foreignKey: "ruleId",
        otherKey: "exchangeId",
        as: "exchanges",
    });
}

export { Rules, Participants, Exchange, Assigned };
