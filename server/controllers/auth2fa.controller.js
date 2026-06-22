import speakeasy from "speakeasy";
import qrcode from "qrcode";
import User from "../models/User.js";

export const generate2FASecret = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `ParkFinder (${user.email})`,
    });

    // We do NOT set isTwoFactorEnabled to true yet.
    // We just save the secret temporarily or the user must verify immediately.
    // For simplicity, we'll save it to the user now, but keep isTwoFactorEnabled false.
    await User.findByIdAndUpdate(req.user.id, {
      twoFactorSecret: secret.base32,
    });

    // Generate QR code
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error generating QR code" });
      }
      res.json({
        success: true,
        secret: secret.base32,
        qrCode: data_url,
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select("+twoFactorSecret");
    
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: "2FA not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: "2FA successfully enabled" });
    } else {
      res.status(400).json({ success: false, message: "Invalid 2FA token" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select("+twoFactorSecret");

    if (!user || !user.isTwoFactorEnabled) {
      return res.status(400).json({ success: false, message: "2FA is not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (verified) {
      user.isTwoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();
      res.json({ success: true, message: "2FA successfully disabled" });
    } else {
      res.status(400).json({ success: false, message: "Invalid 2FA token" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
