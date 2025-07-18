jest.mock("../../src/services/emailService", () => ({
  __esModule: true,
  sendUserPasswordResetEmail: jest.fn(),
}));

jest.mock("../../src/models/PasswordResetToken", () => ({
  __esModule: true,
  default: {
    upsert: jest.fn(),
  },
}));

const { sendPasswordResetEmail } = require("../../src/services/authService");
const emailService = require("../../src/services/emailService");
const PasswordResetToken =
  require("../../src/models/PasswordResetToken").default;

describe("sendPasswordResetEmail", () => {
  it("devrait générer et stocker un token de réinitialisation", async () => {
    const fakeUser = {
      id: "user-id-123",
      email: "test@example.com",
    };

    await sendPasswordResetEmail(fakeUser);

    expect(PasswordResetToken.upsert).toHaveBeenCalledTimes(1);
    const [data] = PasswordResetToken.upsert.mock.calls[0];

    expect(data.userId).toBe(fakeUser.id);
    expect(typeof data.token).toBe("string");
    expect(data.expiresAt instanceof Date).toBe(true);

    expect(emailService.sendUserPasswordResetEmail).toHaveBeenCalledWith(
      fakeUser.email,
      data.token
    );
  });
});
