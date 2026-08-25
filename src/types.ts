export type InstagramUser = {
  username: string;
  href: string;
  timestamp?: number;
};

export type AnalysisResult = {
  followers: InstagramUser[];
  following: InstagramUser[];
  notFollowingBack: InstagramUser[];
  youDontFollowBack: InstagramUser[];
  mutuals: InstagramUser[];
};
