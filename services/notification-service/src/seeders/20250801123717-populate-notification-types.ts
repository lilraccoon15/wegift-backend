import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert("notifications_types", [
      {
        id: "00139bd8-633a-11f0-91f9-d4ae52cd72ed",
        type: "exchange-invite",
        text: "vous invite à participer à un échange",
      },
      {
        id: "73c8a6cd-7f6a-4e2d-8de0-faa517a3edfd",
        type: "exchange-assign",
        text: "Vous avez reçu votre assignation à",
      },
      {
        id: "9f58e58e-3f4b-4d7a-9b63-8572d0b41f73",
        type: "exchange-accept",
        text: "a accepté de participer à l'échange",
      },
      {
        id: "b6d3d61e-9a85-4e1d-85f6-5037cb2cbe0c",
        type: "exchange-reject",
        text: "a refusé de participer à l'échange",
      },
      {
        id: "d3b5cdd7-5489-4f4f-b213-0f514a6bc36e",
        type: "friendship-accept",
        text: "a accepté votre demande d'amitié",
      },
      {
        id: "d53ab580-5684-11f0-91f9-d4ae52cd72ed",
        type: "friendship",
        text: "vous a demandé en ami(e)",
      },
      {
        id: "eac5de92-fb6e-4c1e-a749-efc4718b2b98",
        type: "wishlist-sub",
        text: "s'est abonné à votre liste",
      },
      {
        id: "fa1e6c9d-1d9b-4a88-90ea-510b78cfb055",
        type: "wishlist-new-wish",
        text: "Un nouveau souhait a été ajouté à",
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("notifications_types", {
      type: [
        "exchange-invite",
        "exchange-assign",
        "exchange-accept",
        "exchange-reject",
        "friendship-accept",
        "friendship",
        "wishlist-sub",
        "wishlist-new-wish",
      ],
    });
  },
};
