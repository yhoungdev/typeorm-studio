import type { StudioDataset } from "@/lib/types"

export const studioDataset: StudioDataset = {
  models: [
    {
      name: "User",
      tableName: "users",
      columns: [
        { name: "id", type: "int", isPrimary: true },
        { name: "email", type: "varchar" },
        { name: "role", type: "varchar" },
        { name: "createdAt", type: "timestamp" },
        { name: "isActive", type: "boolean" },
      ],
      relations: [],
    },
    {
      name: "Project",
      tableName: "projects",
      columns: [
        { name: "id", type: "int", isPrimary: true },
        { name: "name", type: "varchar" },
        { name: "visibility", type: "varchar" },
        { name: "ownerId", type: "int" },
        { name: "archivedAt", type: "timestamp", nullable: true },
      ],
      relations: [{ field: "ownerId", references: "users.id" }],
    },
    {
      name: "Session",
      tableName: "sessions",
      columns: [
        { name: "id", type: "int", isPrimary: true },
        { name: "userId", type: "int" },
        { name: "status", type: "varchar" },
        { name: "device", type: "varchar" },
        { name: "expiresAt", type: "timestamp" },
      ],
      relations: [{ field: "userId", references: "users.id" }],
    },
  ],
  rows: {
    users: [
      { id: 1, email: "ada@typeorm.dev", role: "admin", createdAt: "2026-02-21", isActive: true },
      { id: 2, email: "sam@typeorm.dev", role: "editor", createdAt: "2026-02-22", isActive: false },
      { id: 3, email: "jules@typeorm.dev", role: "viewer", createdAt: "2026-02-24", isActive: true },
    ],
    projects: [
      { id: 11, name: "Studio", visibility: "private", ownerId: 1, archivedAt: null },
      { id: 12, name: "Dashboard", visibility: "public", ownerId: 2, archivedAt: null },
      { id: 13, name: "Internal API", visibility: "private", ownerId: 1, archivedAt: "2026-02-25" },
    ],
    sessions: [
      { id: 101, userId: 1, status: "active", device: "macOS", expiresAt: "2026-03-01" },
      { id: 102, userId: 2, status: "expired", device: "Windows", expiresAt: "2026-02-20" },
      { id: 103, userId: 3, status: "active", device: "Linux", expiresAt: "2026-02-28" },
    ],
  },
}
