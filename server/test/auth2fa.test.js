import { describe, it, expect, vi, beforeEach } from "vitest";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  generate2FASecret,
  verify2FASetup,
  disable2FA,
} from "../controllers/auth2fa.controller.js";
import { login, verify2FALogin } from "../controllers/auth.controller.js";

vi.mock("../models/User.js", () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("speakeasy", () => ({
  default: {
    generateSecret: vi.fn(),
    totp: {
      verify: vi.fn(),
    },
  },
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("2FA Controllers Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generate2FASecret", () => {
    it("should generate a secret and qr code if user exists", async () => {
      User.findById.mockResolvedValueOnce({ _id: "u1", email: "test@test.com" });
      speakeasy.generateSecret.mockReturnValue({
        base32: "SECRET32",
        otpauth_url: "otpauth://...",
      });
      User.findByIdAndUpdate.mockResolvedValueOnce({});
      qrcode.toDataURL.mockImplementation((url, cb) => cb(null, "data:image/png;base64,123"));

      const req = { user: { id: "u1" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await generate2FASecret(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        secret: "SECRET32",
        qrCode: "data:image/png;base64,123",
      });
    });

    it("should return 404 if user not found", async () => {
      User.findById.mockResolvedValueOnce(null);

      const req = { user: { id: "u1" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await generate2FASecret(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
    });
  });

  describe("verify2FASetup", () => {
    it("should enable 2FA with valid token", async () => {
      const mockUser = {
        _id: "u1",
        twoFactorSecret: "SECRET32",
        isTwoFactorEnabled: false,
        save: vi.fn().mockResolvedValueOnce(true),
      };

      // Mock select method chain
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      });

      speakeasy.totp.verify.mockReturnValueOnce(true);

      const req = { user: { id: "u1" }, body: { token: "123456" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await verify2FASetup(req, res);

      expect(mockUser.isTwoFactorEnabled).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "2FA successfully enabled" });
    });

    it("should return 400 for invalid token", async () => {
      const mockUser = {
        _id: "u1",
        twoFactorSecret: "SECRET32",
      };
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      });
      speakeasy.totp.verify.mockReturnValueOnce(false);

      const req = { user: { id: "u1" }, body: { token: "000000" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await verify2FASetup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid 2FA token" });
    });
  });

  describe("disable2FA", () => {
    it("should disable 2FA with valid token", async () => {
      const mockUser = {
        _id: "u1",
        twoFactorSecret: "SECRET32",
        isTwoFactorEnabled: true,
        save: vi.fn().mockResolvedValueOnce(true),
      };

      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      });
      speakeasy.totp.verify.mockReturnValueOnce(true);

      const req = { user: { id: "u1" }, body: { token: "123456" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await disable2FA(req, res);

      expect(mockUser.isTwoFactorEnabled).toBe(false);
      expect(mockUser.twoFactorSecret).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "2FA successfully disabled" });
    });
  });

  describe("Login Flow with 2FA", () => {
    it("should return requires2FA true and temp token for admin with 2FA", async () => {
      const mockUser = {
        _id: "admin1",
        email: "admin@test.com",
        password: "hashed",
        role: "admin",
        isTwoFactorEnabled: true,
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      process.env.JWT_SECRET = "secret";
      jwt.sign.mockReturnValueOnce("tempToken123");

      const req = { body: { email: "admin@test.com", password: "password" } };
      const res = {
        json: vi.fn(),
      };

      await login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "admin1", role: "admin", isTemp: true },
        "secret",
        { expiresIn: "5m" }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        requires2FA: true,
        tempToken: "tempToken123",
      });
    });

    it("should return normal token for user without 2FA", async () => {
      const mockUser = {
        _id: "user1",
        email: "user@test.com",
        password: "hashed",
        role: "user",
        name: "Test",
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      process.env.JWT_SECRET = "secret";
      jwt.sign.mockReturnValueOnce("fullToken");

      const req = { body: { email: "user@test.com", password: "password" } };
      const res = {
        json: vi.fn(),
      };

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "fullToken",
        user: {
          _id: "user1",
          name: "Test",
          email: "user@test.com",
          role: "user",
        },
      });
    });
  });

  describe("verify2FALogin", () => {
    it("should login successfully with valid tempToken and TOTP token", async () => {
      const decodedTempToken = { id: "admin1", role: "admin", isTemp: true };
      const mockUser = {
        _id: "admin1",
        role: "admin",
        name: "Admin",
        email: "admin@test.com",
        isTwoFactorEnabled: true,
        twoFactorSecret: "SECRET32",
      };

      jwt.verify.mockReturnValueOnce(decodedTempToken);
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      });
      speakeasy.totp.verify.mockReturnValueOnce(true);
      process.env.JWT_SECRET = "secret";
      jwt.sign.mockReturnValueOnce("finalToken");

      const req = { body: { tempToken: "temp", token: "123456" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await verify2FALogin(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "finalToken",
        user: {
          _id: "admin1",
          name: "Admin",
          email: "admin@test.com",
          role: "admin",
        },
      });
    });

    it("should fail if tempToken is invalid or expired", async () => {
      jwt.verify.mockImplementationOnce(() => { throw new Error("expired"); });

      const req = { body: { tempToken: "invalid", token: "123456" } };
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      await verify2FALogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Temporary token expired or invalid" });
    });
  });
});
