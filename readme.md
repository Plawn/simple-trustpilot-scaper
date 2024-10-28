# Trustpilot simple scraper

## How to

For example:

```sh
deno run --allow-net --allow-write scrape.ts "https://fr.trustpilot.com/review/www.laposte.fr" 1
```

If the script crashes, start at the last succeeded page, using the last parameter
