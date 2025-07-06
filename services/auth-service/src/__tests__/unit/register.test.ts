import * as authService from "../../services/authService";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as emailService from "../../services/emailService";
import axios from "axios";

jest.mock("../../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../services/emailService");
jest.mock("axios");

describe("authService.registerUser", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should throw error if birthDate is in the future", async () => {
        await expect(
            authService.createUser({
                pseudo: "Test",
                birthDate: "2999-01-01",
                email: "test@example.com",
                password: "Aa1!aaaa",
                acceptedTerms: true,
                newsletter: false,
            })
        ).rejects.toThrow(
            "La date de naissance ne peut pas être dans le futur."
        );
    });

    it("should throw error if acceptedTerms is false", async () => {
        await expect(
            authService.createUser({
                pseudo: "User",
                birthDate: "1990-01-01",
                email: "test@example.com",
                password: "Aa1!aaaa",
                acceptedTerms: false,
                newsletter: false,
            })
        ).rejects.toThrow(
            "Vous devez accepter les conditions générales d'utilisation."
        );
    });

    it("should throw error if user already exists", async () => {
        (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

        await expect(
            authService.createUser({
                pseudo: "User",
                birthDate: "1990-01-01",
                email: "test@example.com",
                password: "Aa1!aaaa",
                acceptedTerms: true,
                newsletter: false,
            })
        ).rejects.toThrow("Cet email est déjà enregistré.");
    });

    it("should create user and send activation email", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
        (User.create as jest.Mock).mockResolvedValue({
            id: 123,
            email: "test@example.com",
        });
        (jwt.sign as jest.Mock).mockReturnValue("token");
        (emailService.sendUserActivationEmail as jest.Mock).mockResolvedValue(
            undefined
        );
        (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

        const user = await authService.createUser({
            pseudo: "User",
            birthDate: "1990-01-01",
            email: "test@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        });

        expect(user).toHaveProperty("id", 123);
        expect(emailService.sendUserActivationEmail).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalled();
    });
});
