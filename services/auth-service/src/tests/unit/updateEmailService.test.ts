import { changeUserEmail } from "../../services/authService";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendUserActivationEmail } from "../../services/emailService";

jest.mock("../../src/models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../src/services/emailService");

describe("changeUserEmail", () => {
    const userId = 1;
    const currentPassword = "MotDePasse123!";
    const newEmail = "nouvel@example.com";
    const mockUser = {
        id: userId,
        email: "ancien@example.com",
        password: "hashedPassword",
        isActive: true,
        save: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("devrait changer l'email et envoyer un mail d'activation", async () => {
        (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (User.findOne as jest.Mock).mockResolvedValue(null);
        (jwt.sign as jest.Mock).mockReturnValue("faketoken");

        await changeUserEmail(userId, currentPassword, newEmail);

        expect(mockUser.email).toBe(newEmail);
        expect(mockUser.isActive).toBe(false);
        expect(mockUser.save).toHaveBeenCalled();
        expect(sendUserActivationEmail).toHaveBeenCalledWith(
            newEmail,
            "faketoken"
        );
    });

    it("devrait échouer si l'utilisateur n'existe pas", async () => {
        (User.findByPk as jest.Mock).mockResolvedValue(null);

        await expect(
            changeUserEmail(userId, currentPassword, newEmail)
        ).rejects.toThrow("Utilisateur non trouvé.");
    });

    it("devrait échouer si l'email est identique", async () => {
        (User.findByPk as jest.Mock).mockResolvedValue({
            ...mockUser,
            email: newEmail,
        });

        await expect(
            changeUserEmail(userId, currentPassword, newEmail)
        ).rejects.toThrow("Le nouvel email est identique à l'actuel.");
    });

    it("devrait échouer si le mot de passe est incorrect", async () => {
        (User.findByPk as jest.Mock).mockResolvedValue({
            ...mockUser,
            email: "autre@example.com",
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
            changeUserEmail(userId, currentPassword, newEmail)
        ).rejects.toThrow("Mot de passe incorrect.");
    });

    it("devrait échouer si le nouvel email est déjà utilisé", async () => {
        (User.findByPk as jest.Mock).mockResolvedValue({
            ...mockUser,
            email: "autre@example.com",
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (User.findOne as jest.Mock).mockResolvedValue({ id: 2 });

        await expect(
            changeUserEmail(userId, currentPassword, newEmail)
        ).rejects.toThrow("Email déjà utilisé.");
    });
});
