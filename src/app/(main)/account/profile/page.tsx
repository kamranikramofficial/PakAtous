"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ProfileImageUpload } from "@/components/ui/profile-image-upload";
import { 
  Shield, 
  Smartphone, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  LogOut,
  Key,
  Mail,
  Clock,
  Copy,
  Download,
  RefreshCw
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  image: string;
}

interface SecurityStatus {
  hasPassword: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorEnabledAt: string | null;
  backupCodesCount: number;
  lastLoginAt: string | null;
  accountCreatedAt: string;
}

interface SessionInfo {
  id: string;
  expires: string;
  createdAt: string;
  isCurrent: boolean;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    image: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Security & Sessions State
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // 2FA State
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<"setup" | "verify" | "backup" | "disable">("setup");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAQRCode, setTwoFAQRCode] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [processing2FA, setProcessing2FA] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            postalCode: data.postalCode || "",
            country: data.country || "Pakistan",
            image: data.image || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSecurityStatus = async () => {
      try {
        const res = await fetch("/api/user/security");
        if (res.ok) {
          const data = await res.json();
          setSecurityStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch security status:", error);
      }
    };

    fetchProfile();
    fetchSecurityStatus();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          image: profile.image,
        }),
      });

      if (res.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        // Update session with new name and image
        update({ name: profile.name, image: profile.image });
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (res.ok) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully.",
        });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to change password");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Fetch active sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/user/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Revoke a specific session
  const revokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const res = await fetch(`/api/user/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Session revoked",
          description: "The session has been logged out successfully.",
        });
        fetchSessions();
      } else {
        throw new Error("Failed to revoke session");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
    } finally {
      setRevokingSession(null);
    }
  };

  // Revoke all sessions
  const revokeAllSessions = async () => {
    try {
      const res = await fetch("/api/user/sessions?all=true", {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "All sessions revoked",
          description: "You have been logged out from all devices.",
        });
        // Sign out current session as well
        signOut({ callbackUrl: "/auth/login" });
      } else {
        throw new Error("Failed to revoke sessions");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke all sessions",
        variant: "destructive",
      });
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE MY ACCOUNT") {
      toast({
        title: "Error",
        description: "Please type 'DELETE MY ACCOUNT' to confirm",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });

      if (res.ok) {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        });
        signOut({ callbackUrl: "/" });
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 2FA Functions
  const setup2FA = async () => {
    setProcessing2FA(true);
    try {
      const res = await fetch("/api/user/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setup-2fa",
          password: twoFAPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTwoFASecret(data.secret);
        setTwoFAQRCode(data.qrCode);
        setTwoFAStep("verify");
      } else {
        throw new Error(data.error || "Failed to setup 2FA");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setProcessing2FA(false);
    }
  };

  const verify2FA = async () => {
    if (twoFACode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setProcessing2FA(true);
    try {
      const res = await fetch("/api/user/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-2fa",
          code: twoFACode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBackupCodes(data.backupCodes);
        setTwoFAStep("backup");
        // Refresh security status
        const statusRes = await fetch("/api/user/security");
        if (statusRes.ok) {
          setSecurityStatus(await statusRes.json());
        }
        toast({
          title: "Success",
          description: "Two-factor authentication enabled!",
        });
      } else {
        throw new Error(data.error || "Invalid code");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify",
        variant: "destructive",
      });
    } finally {
      setProcessing2FA(false);
    }
  };

  const disable2FA = async () => {
    setProcessing2FA(true);
    try {
      const res = await fetch("/api/user/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disable-2fa",
          password: twoFAPassword,
          code: twoFACode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: "Two-factor authentication disabled",
        });
        setShow2FADialog(false);
        reset2FAState();
        // Refresh security status
        const statusRes = await fetch("/api/user/security");
        if (statusRes.ok) {
          setSecurityStatus(await statusRes.json());
        }
      } else {
        throw new Error(data.error || "Failed to disable 2FA");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setProcessing2FA(false);
    }
  };

  const reset2FAState = () => {
    setTwoFAStep("setup");
    setTwoFASecret("");
    setTwoFAQRCode("");
    setTwoFACode("");
    setTwoFAPassword("");
    setBackupCodes([]);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const codesText = `PakAutoSe Backup Codes\n${"=".repeat(30)}\n\n${backupCodes.join("\n")}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pakautose-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <ProfileImageUpload
              value={profile.image}
              onChange={(url) => setProfile({ ...profile, image: url })}
              name={profile.name || "User"}
              disabled={saving}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 font-medium">Default Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="House/Apartment, Street, Area"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="Lahore"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Province/State</Label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    placeholder="Punjab"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    placeholder="54000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    placeholder="Pakistan"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2 sm:w-1/2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your security settings and active sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Verification Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>
            {securityStatus?.emailVerified ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Not Verified
                </Badge>
                <Button variant="outline" size="sm">
                  Resend Email
                </Button>
              </div>
            )}
          </div>

          {/* Password Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  {securityStatus?.hasPassword 
                    ? "Password is set for your account" 
                    : "Sign in with social account only"}
                </p>
              </div>
            </div>
            {securityStatus?.hasPassword ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="secondary">Social Login</Badge>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {securityStatus?.twoFactorEnabled 
                    ? `Enabled ${securityStatus.twoFactorEnabledAt ? `on ${formatDate(securityStatus.twoFactorEnabledAt)}` : ""}`
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
            </div>
            {securityStatus?.twoFactorEnabled ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Enabled
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setTwoFAStep("disable");
                    setShow2FADialog(true);
                  }}
                >
                  Disable
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  reset2FAState();
                  setShow2FADialog(true);
                }}
              >
                Enable 2FA
              </Button>
            )}
          </div>

          {/* Active Sessions */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Manage devices where you&apos;re logged in
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowSessionsDialog(true);
                fetchSessions();
              }}
            >
              View Sessions
            </Button>
          </div>

          {/* Last Login */}
          {securityStatus?.lastLoginAt && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(securityStatus.lastLoginAt)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Dialog */}
      <Dialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Devices where you are currently logged in
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No active sessions found
              </p>
            ) : (
              sessions.map((sess) => (
                <div 
                  key={sess.id} 
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Session {sess.isCurrent && "(Current)"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDate(sess.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(sess.expires)}
                      </p>
                    </div>
                  </div>
                  {!sess.isCurrent && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => revokeSession(sess.id)}
                      disabled={revokingSession === sess.id}
                    >
                      {revokingSession === sess.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={revokeAllSessions}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out All Devices
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowSessionsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Warning: This will permanently delete:
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Your profile and personal information</li>
                <li>Your order history</li>
                <li>Your saved addresses</li>
                <li>Your cart items</li>
                <li>Your reviews (will be anonymized)</li>
              </ul>
            </div>

            {securityStatus?.hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="delete-password">Enter your password</Label>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="Your current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
              </Label>
              <Input
                id="delete-confirmation"
                placeholder="DELETE MY ACCOUNT"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
                setDeletePassword("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmation !== "DELETE MY ACCOUNT"}
            >
              {deleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={(open) => {
        if (!open) reset2FAState();
        setShow2FADialog(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {twoFAStep === "disable" ? "Disable" : "Enable"} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {twoFAStep === "setup" && "Enter your password to start setting up 2FA"}
              {twoFAStep === "verify" && "Scan the QR code with your authenticator app"}
              {twoFAStep === "backup" && "Save your backup codes in a safe place"}
              {twoFAStep === "disable" && "Enter your password and verification code to disable 2FA"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Step 1: Password verification */}
            {twoFAStep === "setup" && (
              <>
                {securityStatus?.hasPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="2fa-password">Password</Label>
                    <Input
                      id="2fa-password"
                      type="password"
                      placeholder="Enter your password"
                      value={twoFAPassword}
                      onChange={(e) => setTwoFAPassword(e.target.value)}
                    />
                  </div>
                )}
                <Button 
                  className="w-full" 
                  onClick={setup2FA}
                  disabled={processing2FA || (securityStatus?.hasPassword && !twoFAPassword)}
                >
                  {processing2FA ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </>
            )}

            {/* Step 2: QR Code and verification */}
            {twoFAStep === "verify" && (
              <>
                <div className="flex flex-col items-center gap-4">
                  {twoFAQRCode && (
                    <img 
                      src={twoFAQRCode} 
                      alt="2FA QR Code" 
                      className="h-48 w-48 rounded-lg border p-2"
                    />
                  )}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Can&apos;t scan? Enter this code manually:
                    </p>
                    <code className="mt-1 block rounded bg-muted px-3 py-1 text-sm font-mono">
                      {twoFASecret}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="2fa-code">Verification Code</Label>
                  <Input
                    id="2fa-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ""))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code shown in your authenticator app. Codes change every 30 seconds.
                    Make sure your phone&apos;s time is synced correctly.
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={verify2FA}
                  disabled={processing2FA || twoFACode.length !== 6}
                >
                  {processing2FA ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </Button>
              </>
            )}

            {/* Step 3: Backup codes */}
            {twoFAStep === "backup" && (
              <>
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm font-medium text-yellow-800">
                    Important: Save these backup codes
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    If you lose access to your authenticator app, you can use these codes to log in.
                    Each code can only be used once.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg border p-4 bg-muted/50">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={copyBackupCodes}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={downloadBackupCodes}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => {
                    setShow2FADialog(false);
                    reset2FAState();
                  }}
                >
                  Done
                </Button>
              </>
            )}

            {/* Disable 2FA */}
            {twoFAStep === "disable" && (
              <>
                {securityStatus?.hasPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="disable-2fa-password">Password</Label>
                    <Input
                      id="disable-2fa-password"
                      type="password"
                      placeholder="Enter your password"
                      value={twoFAPassword}
                      onChange={(e) => setTwoFAPassword(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="disable-2fa-code">Verification Code or Backup Code</Label>
                  <Input
                    id="disable-2fa-code"
                    type="text"
                    placeholder="Enter code from app or backup code"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                  />
                </div>

                <Button 
                  variant="destructive"
                  className="w-full" 
                  onClick={disable2FA}
                  disabled={processing2FA || !twoFACode}
                >
                  {processing2FA ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    "Disable 2FA"
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
