# LD flag archiver

Given a CSV of LD flag keys, this tool will iterate through the list and archive the flags while respecting LD rate limits 😎

## Setup

```
git clone https://github.com/theChumpus/ld-flag-archiver.git
cd ld-flag-archiver
yarn install
```

## How to use

### Check Flag Usage

Before you can search for references to the flag in the WS codebase, you'll need to generate a new GH access token.

1. In GH, go to Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token (classic)
2. Generate a new access token with `repo` access. Remember to authorize with SSO!

```
export GITHUB_ACCESS_TOKEN=<insert API token here>

yarn usage <path to CSV>
```

### Archive flags

To actually archive flags, you'll need to generate a LaunchDarkly API token.

```
export LD_API_TOKEN=<insert API token here>

yarn archive <path to CSV>
```

## CSV format

CSVs can be comma-separated or new-line-separated but should just contain a list of LD flag keys

```
flag-name-1
flag-name-2
another-flag
```
