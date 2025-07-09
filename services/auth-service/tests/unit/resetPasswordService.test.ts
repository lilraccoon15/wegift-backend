import bcrypt from "bcrypt";
import * as service from "../../src/services/authService";
import User from "../../src/models/User";
import PasswordResetToken from "../../src/models/PasswordResetToken";

jest.mock("../../src/models/User", () => ({
  findByPk: jest.fn(),
}));

jest.mock("../../src/models/PasswordResetToken", () => ({
  findOne: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(() => "hashed-pw"),
}));

describe("resetUserPassword", () => {
  const fakeToken = "reset-token";
  const newPassword = "NewPassw0rd!";

  it("réinitialise le mot de passe et supprime le token", async () => {
    const user = { id: 1, password: "old", save: jest.fn() };

    (PasswordResetToken.findOne as jest.Mock).mockResolvedValue({
      token: fakeToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 10000),
    });

    (User.findByPk as jest.Mock).mockResolvedValue(user);

    await service.resetUserPassword(fakeToken, newPassword);

    expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    expect(user.save).toHaveBeenCalled();
    expect(user.password).toBe("hashed-pw");
    expect(PasswordResetToken.destroy).toHaveBeenCalledWith({
      where: { token: fakeToken },
    });
  });
});
