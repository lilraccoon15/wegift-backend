import { setUserAsActive } from "../../services/authService";
import User from "../../models/User";
import axios from "axios";
import jwt from "jsonwebtoken";
import { NotFoundError } from "../../errors/CustomErrors";
import currentConfig from "../../config";

jest.mock("../../src/models/User");
jest.mock("axios");

describe("setUserAsActive", () => {
    it("devrait activer un utilisateur inactif et appeler l'API de création de profil", async () => {
        const token = "validToken";
        const decodedToken = {
            id: 1,
            pseudo: "User1",
            birthDate: "1990-01-01",
        };

        jwt.verify = jest.fn().mockReturnValue(decodedToken);
        User.findByPk = jest.fn().mockResolvedValue({
            id: 1,
            email: "user@example.com",
            isActive: false,
            save: jest.fn(),
        });
        axios.post = jest.fn().mockResolvedValue({});

        const result = await setUserAsActive(token);

        expect(result).toBe("Success");
        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(axios.post).toHaveBeenCalledWith(
            `${currentConfig.apiUrls.USER_SERVICE}/create-profile`,
            expect.objectContaining({
                userId: 1,
                pseudo: decodedToken.pseudo,
                birthDate: decodedToken.birthDate,
            }),
            expect.anything()
        );
    });

    it("devrait renvoyer AlreadyActive si l'utilisateur est déjà actif", async () => {
        const token = "validToken";
        const decodedToken = {
            id: 1,
            pseudo: "User1",
            birthDate: "1990-01-01",
        };

        jwt.verify = jest.fn().mockReturnValue(decodedToken);
        User.findByPk = jest.fn().mockResolvedValue({
            id: 1,
            email: "user@example.com",
            isActive: true,
            save: jest.fn(),
        });

        const result = await setUserAsActive(token);

        expect(result).toBe("AlreadyActive");
    });

    it("devrait échouer si l'utilisateur n'est pas trouvé", async () => {
        const token = "validToken";
        const decodedToken = {
            id: 1,
            pseudo: "User1",
            birthDate: "1990-01-01",
        };

        jwt.verify = jest.fn().mockReturnValue(decodedToken);
        User.findByPk = jest.fn().mockResolvedValue(null);

        await expect(setUserAsActive(token)).rejects.toThrowError(
            new NotFoundError("Utilisateur non trouvé.")
        );
    });
});
