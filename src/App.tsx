import { useState, useMemo } from "react";
import type { InstagramUser, AnalysisResult } from "./types";
import { parseFollowers, parseFollowing } from "./instagramParser";
import { analyze } from "./analyzer";
import { exportCsv } from "./exportCsv";
import "./App.css";

type Tab = "notFollowingBack" | "youDontFollowBack" | "mutuals" | "followers" | "following";

const TAB_LABELS: Record<Tab, string> = {
  notFollowingBack: "Don't Follow You Back",
  youDontFollowBack: "You Don't Follow Back",
  mutuals: "Mutuals",
  followers: "All Followers",
  following: "All Following",
};

function UserList({ users, title }: { users: InstagramUser[]; title: string }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.username.includes(q));
  }, [users, search]);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>
          {title} ({filtered.length})
        </h3>
        <div className="user-list-actions">
          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button
            className="btn btn-secondary"
            onClick={() => exportCsv(filtered, `${title.toLowerCase().replace(/\s+/g, "_")}.csv`)}
          >
            Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-message">No users found.</p>
      ) : (
        <ul className="user-list-items">
          {filtered.map((user) => (
            <li key={user.username} className="user-item">
              <span className="username">{user.username}</span>
              <div className="user-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => navigator.clipboard.writeText(user.username)}
                  title="Copy username"
                >
                  Copy
                </button>
                <a
                  href={user.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  Open Profile
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("notFollowingBack");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFiles(followerFile: File | null, followingFile: File | null) {
    setError(null);
    setResult(null);

    if (!followerFile || !followingFile) {
      setError("Please select both a followers file and a following file.");
      return;
    }

    setLoading(true);

    const readAsJson = (file: File): Promise<unknown> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            resolve(JSON.parse(reader.result as string));
          } catch {
            reject(new Error(`Failed to parse ${file.name} as JSON.`));
          }
        };
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
        reader.readAsText(file);
      });

    Promise.all([readAsJson(followerFile), readAsJson(followingFile)])
      .then(([followersRaw, followingRaw]) => {
        const followers = parseFollowers(followersRaw);
        const following = parseFollowing(followingRaw);
        setResult(analyze(followers, following));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const followerFile = files.find((f) => /followers.*\.json$/i.test(f.name));
    const followingFile = files.find((f) => /following.*\.json$/i.test(f.name));

    handleFiles(followerFile ?? null, followingFile ?? null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      className="app"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header className="app-header">
        <h1>Instagram Follow Analyzer</h1>
        <p className="subtitle">
          Analyze your Instagram followers &amp; following. Everything runs locally in your browser — nothing is uploaded.
        </p>
      </header>

      {!result && (
        <main className="upload-section">
          <div className="upload-card">
            <h2>How to use</h2>
            <ol className="instructions">
              <li>
                Go to <strong>Instagram &gt; Settings &gt; Privacy and Security &gt; Data Download</strong> and request your data in <strong>JSON</strong> format.
              </li>
              <li>Download the ZIP and extract it.</li>
              <li>
                Find <code>followers_1.json</code> and <code>following.json</code> in the <code>followers_and_following</code> folder.
              </li>
              <li>Upload both files below.</li>
            </ol>

            <div className="file-inputs">
              <label className="file-label">
                <span className="file-label-text">Followers file</span>
                <span className="file-label-hint">followers_1.json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const f1 = e.target.files?.[0] ?? null;
                    const f2 =
                      (document.getElementById("following-input") as HTMLInputElement)
                        ?.files?.[0] ?? null;
                    if (f1 && f2) handleFiles(f1, f2);
                  }}
                  id="followers-input"
                  className="file-input"
                />
              </label>

              <label className="file-label">
                <span className="file-label-text">Following file</span>
                <span className="file-label-hint">following.json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const f2 = e.target.files?.[0] ?? null;
                    const f1 =
                      (document.getElementById("followers-input") as HTMLInputElement)
                        ?.files?.[0] ?? null;
                    if (f1 && f2) handleFiles(f1, f2);
                  }}
                  id="following-input"
                  className="file-input"
                />
              </label>
            </div>

            <p className="drag-hint">Or drag and drop both files anywhere on this page.</p>

            {loading && <p className="loading">Analyzing...</p>}
            {error && <p className="error">{error}</p>}
          </div>
        </main>
      )}

      {result && (
        <main className="results-section">
          <div className="summary-cards">
            <button
              className="summary-card"
              onClick={() => setActiveTab("followers")}
            >
              <span className="card-number">{result.followers.length}</span>
              <span className="card-label">Followers</span>
            </button>
            <button
              className="summary-card"
              onClick={() => setActiveTab("following")}
            >
              <span className="card-number">{result.following.length}</span>
              <span className="card-label">Following</span>
            </button>
            <button
              className="summary-card"
              onClick={() => setActiveTab("mutuals")}
            >
              <span className="card-number">{result.mutuals.length}</span>
              <span className="card-label">Mutuals</span>
            </button>
            <button
              className="summary-card card-warning"
              onClick={() => setActiveTab("notFollowingBack")}
            >
              <span className="card-number">{result.notFollowingBack.length}</span>
              <span className="card-label">Don't Follow You Back</span>
            </button>
            <button
              className="summary-card card-info"
              onClick={() => setActiveTab("youDontFollowBack")}
            >
              <span className="card-number">{result.youDontFollowBack.length}</span>
              <span className="card-label">You Don't Follow Back</span>
            </button>
          </div>

          <div className="tabs">
            {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === "notFollowingBack" && (
              <UserList
                users={result.notFollowingBack}
                title="Don't Follow You Back"
              />
            )}
            {activeTab === "youDontFollowBack" && (
              <UserList
                users={result.youDontFollowBack}
                title="You Don't Follow Back"
              />
            )}
            {activeTab === "mutuals" && (
              <UserList users={result.mutuals} title="Mutual Followers" />
            )}
            {activeTab === "followers" && (
              <UserList users={result.followers} title="All Followers" />
            )}
            {activeTab === "following" && (
              <UserList users={result.following} title="All Following" />
            )}
          </div>

          <div className="reset-section">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setResult(null);
                setActiveTab("notFollowingBack");
              }}
            >
              Analyze New Files
            </button>
          </div>
        </main>
      )}

      <footer className="app-footer">
        <p>
          Not affiliated with Instagram. This tool does not access your account or send any data to a server.
        </p>
      </footer>
    </div>
  );
}
