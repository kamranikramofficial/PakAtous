import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

// Configure authenticator with a larger time window for clock skew tolerance
// This allows codes from 1 step before and after current time (30 seconds each)
authenticator.options = {
  window: 2, // Allow 2 steps before and after (total 5 valid codes at any time)
  step: 30,  // 30 seconds per step (default)
};

interface TwoFactorSecret {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  enabledAt?: Date;
}

// Generate backup codes
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// GET /api/user/security - Get security status
export async function GET() {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .select('email emailVerified password twoFactorSecret lastLoginAt createdAt')
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const twoFactor = (user as any).twoFactorSecret as TwoFactorSecret | undefined;

    return NextResponse.json({
      hasPassword: !!(user as any).password,
      emailVerified: !!(user as any).emailVerified,
      twoFactorEnabled: twoFactor?.enabled || false,
      twoFactorEnabledAt: twoFactor?.enabledAt || null,
      backupCodesCount: twoFactor?.backupCodes?.length || 0,
      lastLoginAt: (user as any).lastLoginAt,
      accountCreatedAt: (user as any).createdAt,
    });
  } catch (error) {
    console.error("Error fetching security status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/user/security - 2FA actions
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, password, code } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password for sensitive actions (not for verify-2fa as user already provided password during setup)
    const actionsRequiringPassword = ["setup-2fa", "disable-2fa", "regenerate-backup-codes"];
    if (user.password && actionsRequiringPassword.includes(action)) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 400 }
        );
      }
    }

    switch (action) {
      case "setup-2fa": {
        // Generate new secret
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(
          user.email,
          "PakAutoSe",
          secret
        );
        
        // Generate QR code as data URL
        const qrCodeUrl = await QRCode.toDataURL(otpauth);
        
        // Store secret temporarily (not enabled yet)
        await User.findByIdAndUpdate(session.user.id, {
          twoFactorSecret: {
            enabled: false,
            secret: secret,
            backupCodes: [],
          }
        });

        return NextResponse.json({
          success: true,
          secret: secret,
          qrCode: qrCodeUrl,
          message: "Scan the QR code with your authenticator app, then verify with a code",
        });
      }

      case "verify-2fa": {
        // Refetch user to get the latest twoFactorSecret (stored during setup)
        const freshUser = await User.findById(session.user.id);
        if (!freshUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        // Get the stored secret
        const twoFactor = (freshUser as any).twoFactorSecret as TwoFactorSecret | undefined;
        
        console.log("2FA Verification - twoFactor data:", JSON.stringify(twoFactor));
        
        if (!twoFactor?.secret) {
          return NextResponse.json(
            { error: "Please setup 2FA first" },
            { status: 400 }
          );
        }

        if (!code) {
          return NextResponse.json(
            { error: "Verification code is required" },
            { status: 400 }
          );
        }

        // Clean the code - remove any spaces and ensure it's a string
        const cleanCode = String(code).replace(/\s/g, '').trim();
        
        // Generate what the current valid code should be for debugging
        const expectedCode = authenticator.generate(twoFactor.secret);
        console.log("Verifying code:", cleanCode, "with secret:", twoFactor.secret);
        console.log("Expected current code:", expectedCode);
        console.log("Server time:", new Date().toISOString());
        
        // Verify the TOTP code with the configured window
        const isValid = authenticator.verify({
          token: cleanCode,
          secret: twoFactor.secret,
        });
        console.log("Verification result:", isValid);

        if (!isValid) {
          return NextResponse.json(
            { error: "Invalid verification code. Please make sure your authenticator app time is synchronized." },
            { status: 400 }
          );
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes(10);

        // Enable 2FA
        await User.findByIdAndUpdate(session.user.id, {
          twoFactorSecret: {
            enabled: true,
            secret: twoFactor.secret,
            backupCodes: backupCodes,
            enabledAt: new Date(),
          }
        });

        return NextResponse.json({
          success: true,
          message: "Two-factor authentication enabled successfully",
          backupCodes: backupCodes,
        });
      }

      case "disable-2fa": {
        const twoFactor = (user as any).twoFactorSecret as TwoFactorSecret | undefined;
        
        if (!twoFactor?.enabled) {
          return NextResponse.json(
            { error: "2FA is not enabled" },
            { status: 400 }
          );
        }

        // Verify code before disabling
        if (code) {
          const isValid = authenticator.verify({
            token: code,
            secret: twoFactor.secret!,
          });

          if (!isValid) {
            // Check backup codes
            const backupIndex = twoFactor.backupCodes?.indexOf(code);
            if (backupIndex === undefined || backupIndex === -1) {
              return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 400 }
              );
            }
          }
        }

        await User.findByIdAndUpdate(session.user.id, {
          $unset: { twoFactorSecret: 1 }
        });

        return NextResponse.json({
          success: true,
          message: "Two-factor authentication disabled",
        });
      }

      case "regenerate-backup-codes": {
        const twoFactor = (user as any).twoFactorSecret as TwoFactorSecret | undefined;
        
        if (!twoFactor?.enabled) {
          return NextResponse.json(
            { error: "2FA is not enabled" },
            { status: 400 }
          );
        }

        // Generate new backup codes
        const newBackupCodes = generateBackupCodes(10);

        await User.findByIdAndUpdate(session.user.id, {
          "twoFactorSecret.backupCodes": newBackupCodes
        });

        return NextResponse.json({
          success: true,
          message: "Backup codes regenerated",
          backupCodes: newBackupCodes,
        });
      }

      case "resend-verification": {
        if ((user as any).emailVerified) {
          return NextResponse.json(
            { error: "Email is already verified" },
            { status: 400 }
          );
        }
        // Trigger email verification resend would go here
        return NextResponse.json({
          success: true,
          message: "Verification email sent",
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in security action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
