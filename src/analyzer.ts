import type { InstagramUser, AnalysisResult } from "./types";

export function analyze(
  followers: InstagramUser[],
  following: InstagramUser[]
): AnalysisResult {
  const followerUsernames = new Set(followers.map((u) => u.username));
  const followingUsernames = new Set(following.map((u) => u.username));

  const notFollowingBack = following.filter(
    (u) => !followerUsernames.has(u.username)
  );

  const youDontFollowBack = followers.filter(
    (u) => !followingUsernames.has(u.username)
  );

  const mutuals = following.filter((u) =>
    followerUsernames.has(u.username)
  );

  return {
    followers,
    following,
    notFollowingBack,
    youDontFollowBack,
    mutuals,
  };
}
