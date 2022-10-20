# LD flag archiver

Given a CSV of LD flag keys, this tool will iterate through the list and archive the flags while respecting LD rate limits 😎

## Setup

```
git clone https://github.com/theChumpus/ld-flag-archiver.git
cd ld-flag-archiver
yarn install

export LD_API_TOKEN=<insert API token here>
```

## How to run

```
node index.js <path to CSV>
```

## CSV format

CSVs can be comma-separated or new-line-separated but should just contain a list of LD flag keys

```
flag-name-1
flag-name-2
another-flag
```
