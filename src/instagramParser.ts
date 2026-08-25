import type { InstagramUser } from "./types";

type InstagramEntry = {
  title?: string;
  string_list_data?: {
    href?: string;
    value?: string;
    timestamp?: number;
  }[];
};

type FollowingFile = {
  relationships_following?: InstagramEntry[];
};

function extractUser(entry: InstagramEntry): InstagramUser | null {
  const data = entry.string_list_data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const item = data[0];
  let username = item.value || entry.title || null;

  if (!username && item.href) {
    const match = item.href.match(/\/([^/]+)\/?$/);
    if (match) username = match[1];
  }

  if (!username) return null;

  username = username.trim().replace(/^@/, "").toLowerCase();

  return {
    username,
    href: `https://www.instagram.com/${username}`,
    timestamp: item.timestamp,
  };
}

function dedupe(users: InstagramUser[]): InstagramUser[] {
  const seen = new Set<string>();
  const result: InstagramUser[] = [];
  for (const user of users) {
    if (!seen.has(user.username)) {
      seen.add(user.username);
      result.push(user);
    }
  }
  return result;
}

export function parseFollowers(raw: unknown): InstagramUser[] {
  if (!Array.isArray(raw)) {
    throw new Error(
      "This does not look like a valid followers file. The JSON should be an array."
    );
  }

  const users: InstagramUser[] = [];
  for (const entry of raw) {
    const user = extractUser(entry as InstagramEntry);
    if (user) users.push(user);
  }

  if (users.length === 0) {
    throw new Error(
      "No valid users found in the followers file. Make sure you selected the correct file."
    );
  }

  return dedupe(users);
}

export function parseFollowing(raw: unknown): InstagramUser[] {
  let entries: InstagramEntry[] | undefined;

  if (Array.isArray(raw)) {
    entries = raw as InstagramEntry[];
  } else if (raw && typeof raw === "object") {
    const obj = raw as FollowingFile;
    entries = obj.relationships_following;
  }

  if (!entries || !Array.isArray(entries)) {
    throw new Error(
      "This does not look like a valid following file. Expected a JSON with 'relationships_following' key."
    );
  }

  const users: InstagramUser[] = [];
  for (const entry of entries) {
    const user = extractUser(entry);
    if (user) users.push(user);
  }

  if (users.length === 0) {
    throw new Error(
      "No valid users found in the following file. Make sure you selected the correct file."
    );
  }

  return dedupe(users);
}
