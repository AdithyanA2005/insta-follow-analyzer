import type { InstagramUser } from "./types";

export function exportCsv(
  users: InstagramUser[],
  filename: string
): void {
  const header = "username,profile_url";
  const rows = users.map(
    (u) => `${u.username},${u.href}`
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
