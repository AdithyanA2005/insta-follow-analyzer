# Instagram Follow Analyzer

A local-only web app that analyzes your Instagram followers and following using data exports from Instagram.

**Nothing is uploaded to any server.** Everything runs in your browser.

## Features

- Upload Instagram JSON export files (followers and following)
- See who doesn't follow you back
- See who you don't follow back
- View mutual followers
- Search and filter users
- Export any list as CSV
- Open Instagram profiles directly from the app

## How to Get Your Instagram Data

1. Open Instagram and go to **Settings > Privacy and Security > Data Download**
2. Request your data in **JSON** format
3. Wait for Instagram to email you the download link
4. Download and extract the ZIP file
5. Find the files you need in the `followers_and_following` folder:
   - `followers_1.json` (or `followers.json`)
   - `following.json`

## Getting Started

Requires [mise](https://mise.jdx.dev) (recommended) or Node.js 24+ and pnpm.

```bash
mise install
pnpm install
pnpm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

## Usage

1. Upload both `followers_1.json` and `following.json`
2. View the analysis dashboard
3. Click on any tab to explore the results
4. Use the search bar to filter users
5. Click **Open Profile** to visit someone's Instagram page
6. Click **Copy** to copy a username to your clipboard
7. Click **Export CSV** to download any list

## Tech Stack

- Vite
- React
- TypeScript
- mise for tool version management

## Scripts

```bash
pnpm run dev      # Start dev server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run lint     # Run linter
```

## Privacy

- No Instagram login required
- No data is sent to any server
- No cookies or tracking
- No account access needed
- Your files never leave your browser

## Limitations

- Requires Instagram's JSON data export format
- Does not track changes over time (single snapshot)
- Does not support auto-unfollow (by design - use the Open Profile buttons to manually unfollow)
- Instagram's export format may change without notice

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Instagram or Meta in any way.
