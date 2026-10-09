"use client";

import React, { useState } from "react";
import { Button, Drawer } from "caralstable";
import { CaralIcon } from "@/components/icons";
import { Input } from "@/components/ui";

interface SessionItem {
  id: string;
  device: string;
  date: string;
  location: string;
  isCurrent: boolean;
}

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "1",
    device: "Edge, Windows 10",
    date: "22 ago 2024",
    location: "Buenos Aires, Argentina",
    isCurrent: true,
  },
  {
    id: "2",
    device: "Chrome, macOS Sequoia",
    date: "21 ago 2024",
    location: "Buenos Aires, Argentina",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Firefox, Ubuntu Linux",
    date: "10 ago 2024",
    location: "Buenos Aires, Argentina",
    isCurrent: false,
  },
  {
    id: "4",
    device: "Safari, iPhone 15 Pro",
    date: "2 ago 2024",
    location: "Buenos Aires, Argentina",
    isCurrent: false,
  },
];

export function ProfileSecurityTab() {
  // Password Drawer States
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;

    setPasswordSuccessMsg(true);
    setTimeout(() => {
      setPasswordSuccessMsg(false);
      setIsPasswordDrawerOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1200);
  };

  const handleSignOutSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSignOutAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  return (
    <div className="w-full flex flex-col gap-8 text-left font-poppins">
      {/* ========================================================= */}
      {/* 1. SECCIÓN: PASSWORD                                      */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6 border-b border-neutral-500">
        <div>
          <h4 className="font-bold text-neutral-900 text-base">
            Password & Credentials
          </h4>
          <p className="text-xs text-neutral-800 mt-0.5">
            Manage your personal sign-in password and authentication credentials.
          </p>
        </div>

        {/* Password Card */}
        <div className="space-y-2 ml-0 sm:ml-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-neutral-500 p-4 rounded-xl border border-neutral-500">
          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-danger-light/30 text-danger-hard flex items-center justify-center shrink-0 mt-0.5">
              <CaralIcon name="lock" size={20} />
            </div>

            <div>
              <h5 className="text-sm font-bold text-neutral-900">Password</h5>
              <p className="text-xs text-neutral-800 leading-relaxed max-w-xl">
                To change your password, verify your current password and create a new secure password with at least 8 characters. Change it whenever you suspect unauthorized access.
              </p>
            </div>
          </div>
          <div>
            <Button
              variant="danger"
              hasBorder
              size="sm"
              onClick={() => setIsPasswordDrawerOpen(true)}
              className="shrink-0"
            >
              Change password
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN: ACTIVE SESSIONS                               */}
      {/* ========================================================= */}
      <section className="space-y-4 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-bold text-neutral-900 text-base">
              Active Sessions
            </h4>
            <p className="text-neutral-800 text-xs mt-0.5 leading-relaxed">
              The devices and web browsers currently signed into your personal account are listed below. If you notice unrecognized activity, sign out all other sessions immediately.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            hasBorder
            onClick={handleSignOutAllOtherSessions}
            className="shrink-0 font-medium"
          >
            Sign out other sessions
          </Button>
        </div>

        {/* Sessions Table */}
        <div className="w-full bg-container border border-neutral-500 overflow-hidden rounded-xl shadow-xs ml-0 sm:ml-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-500 border-b border-neutral-500 text-neutral-900 font-semibold">
                <th className="p-3.5 pl-4">Device & Browser</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Approximate Location</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-400/60">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-neutral-500/5 transition-colors">
                  <td className="p-3.5 pl-4 font-medium text-neutral-900">
                    <div className="flex items-center gap-2">
                      <CaralIcon name="pc" size={16} classname="text-neutral-800" />
                      <span>{session.device}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-neutral-800">
                    {session.date}
                  </td>
                  <td className="p-3.5 text-neutral-800">
                    {session.location}
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    {session.isCurrent ? (
                      <span className="text-xs font-semibold text-success-main italic">
                        Current session
                      </span>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        iconName="x"
                        onClick={() => handleSignOutSession(session.id)}
                        hasBorder
                      >
                        Sign out
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DRAWER: CHANGE PASSWORD                                  */}
      {/* ========================================================= */}
      <Drawer
        isOpen={isPasswordDrawerOpen}
        onClose={() => setIsPasswordDrawerOpen(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handleSavePassword} className="flex flex-col h-full justify-between pb-4 space-y-6 text-left font-poppins">
          <div className="flex-1 overflow-y-auto space-y-5 pt-2 pr-1.5 scrollbar-thin">
            {passwordSuccessMsg && (
              <div className="p-3 rounded-lg bg-success-light text-success-hard border border-success-main/30 text-xs flex items-center gap-2">
                <CaralIcon name="check" size={16} />
                <span>Password changed successfully!</span>
              </div>
            )}

            <Input
              label="Current Password"
              type={showPasswordFields ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              rightElement={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconName={showPasswordFields ? "eyeSlash" : "eye"}
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="!p-1.5 text-neutral-800 hover:text-neutral-900 cursor-pointer"
                />
              }
            />

            <Input
              label="New Password"
              type={showPasswordFields ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              detail="Must be at least 8 characters long."
              required
            />

            <Input
              label="Confirm New Password"
              type={showPasswordFields ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              detail={newPassword && confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : undefined}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-500">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPasswordDrawerOpen(false)}
              className="text-neutral-800 hover:text-neutral-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
              className="font-medium"
            >
              Update password
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
