"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  OFFICE_STAFF: "Office Staff",
  ENGINEER: "Engineer",
};

const ROLE_BADGE_CLASSES: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-800 border-red-200",
  OFFICE_STAFF: "bg-purple-100 text-purple-800 border-purple-200",
  ENGINEER: "bg-blue-100 text-blue-800 border-blue-200",
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

interface UserTableProps {
  users: User[];
  currentUserId: string;
}

export function UserTable({ users: initialUsers, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function toggleActive(userId: string, isActive: boolean) {
    setLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
      );
    } finally {
      setLoading(null);
    }
  }

  async function changeRole(userId: string, role: Role) {
    setLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>Add User</Button>
      </div>

      {showCreate && (
        <CreateUserPanel
          onCreated={(user) => {
            setUsers((prev) => [user, ...prev]);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {["Name", "Email", "Role", "Status", "Created", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className={user.isActive ? "" : "opacity-50"}>
                <td className="px-5 py-3 font-medium text-slate-900">
                  {user.name ?? "—"}
                  {user.id === currentUserId && (
                    <span className="ml-1.5 text-xs text-slate-400">(you)</span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">{user.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value as Role)}
                    disabled={loading === user.id || user.id === currentUserId}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {(["ADMIN", "OFFICE_STAFF", "ENGINEER"] as Role[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3">
                  {user.id !== currentUserId && (
                    <Button
                      variant={user.isActive ? "danger" : "secondary"}
                      size="sm"
                      loading={loading === user.id}
                      onClick={() => toggleActive(user.id, user.isActive)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateUserPanel({
  onCreated,
  onCancel,
}: {
  onCreated: (user: User) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ENGINEER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to create user.");
        return;
      }
      const user = await res.json();
      onCreated(user);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">New User</h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="col-span-2 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          required
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          required
          type="password"
          placeholder="Temporary password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ENGINEER">Engineer</option>
          <option value="OFFICE_STAFF">Office Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        <div className="col-span-2 flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
