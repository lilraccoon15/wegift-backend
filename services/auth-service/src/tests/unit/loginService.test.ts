import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import * as authService from "../../services/authService";

jest.mock("../../src/models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("authService.loginUser", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should return a token when credentials are correct and the account is active", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            isActive: true,
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue("mockedToken");

        const result = await authService.authenticateUser(
            "test@example.com",
            "password123"
        );

        expect(result).toEqual({ token: "mockedToken" });
        expect(User.findOne).toHaveBeenCalledWith({
            where: { email: "test@example.com" },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
            "password123",
            "hashedPassword"
        );
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 1, email: "test@example.com" },
            expect.any(String),
            expect.objectContaining({ expiresIn: "1h" })
        );
    });

    it("should return an error if the email does not exist", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const result = await authService.authenticateUser(
            "notfound@example.com",
            "password"
        );

        expect(result).toEqual({ error: "Email ou mot de passe invalide." });
    });

    it("should return an error if the user exists but the account is not active", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            isActive: false,
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await authService.authenticateUser(
            "test@example.com",
            "password"
        );

        expect(result).toEqual({
            error: "Compte non activé. Merci de vérifier votre email.",
        });
    });

    it("should return an error if the password is incorrect", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            isActive: true,
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await authService.authenticateUser(
            "test@example.com",
            "wrongpassword"
        );

        expect(result).toEqual({ error: "Email ou mot de passe invalide." });
    });
});
