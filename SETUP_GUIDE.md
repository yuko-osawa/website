# Static Website on GitHub Pages — Setup Guide

Content is managed via Google Sheets. A GitHub Action rebuilds the site automatically when you update the sheet. Supports multiple languages (FR / EN / JA).

---

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Site generator | [Jekyll](https://jekyllrb.com/) | Natively supported by GitHub Pages |
| Multilingual | [jekyll-polyglot](https://polyglot.untra.io/) | Language from URL; `site.active_lang` in templates |
| Content source | Google Sheets (published CSV) | No API key required, publicly readable |
| Images | [Cloudinary](https://cloudinary.com/) | Free tier (25GB), permanent URLs, on-the-fly resizing |
| Videos | YouTube embed links | Free |
| CI/CD | GitHub Actions | Fetches Sheets → converts YAML → builds → deploys |

> **Plugin note:** This project uses **jekyll-polyglot**, not `jekyll-multiple-languages-plugin`. They have different APIs. In templates, always use `site.active_lang` (not `page.lang`) and `site.data.meta[site.active_lang]` (not `{% t %}` tags).

---

## Site Structure

| Page | FR URL | EN URL | JA URL |
|---|---|---|---|
| Home | `/` | `/en/` | `/ja/` |
| Agenda | `/agenda/` | `/en/agenda/` | `/ja/agenda/` |

Each page is written **once** in `_pages/`. Jekyll-polyglot generates all language variants automatically at build time.

---

## Key Design Principle — One Config File to Rule Them All

All data structure is defined in **`sheets.yml`** (committed to the repo). The download script and the GitHub Action both read from it. To add or rename a data source, only touch `sheets.yml`.

---

## Step 1 — Pick and Fork a Jekyll Theme

1. Browse free themes at [jekyllthemes.io/free](https://jekyllthemes.io/free) or [jamstackthemes.dev](https://jamstackthemes.dev/ssg/jekyll/).
   - Recommended for multi-page sites with nav: **Minimal Mistakes**, **Beautiful Jekyll**, **Chirpy**
2. On the theme's GitHub repo, click **Fork**.
3. In your fork's **Settings > General**, rename the repo:
   - `your-username.github.io` → site at `https://your-username.github.io`
   - Any other name → site at `https://your-username.github.io/repo-name`
4. In **Settings > Pages**, set Source to `GitHub Actions`.

---

## Step 2 — Set Up Google Sheets (one tab per data source)

Create a new Google Sheet. Add **tabs** named exactly as follows.

> The first column of every tab must always be `lang`. Use `all` for language-independent rows (images, emails, etc.).

### Tab: `agenda`

| lang | date | time | location | title | description | link |
|---|---|---|---|---|---|---|
| fr | 2024-06-15 | 18:00 | Paris | Soirée Concert | Une soirée de musique live | https://... |
| en | 2024-06-15 | 18:00 | Paris | Concert Night | An evening of live music | https://... |

> Repeat each event once per language. Dates must be `YYYY-MM-DD` for correct sorting. Leave `link` empty if there is no URL.

### Tab: `meta`

| lang | label | content |
|---|---|---|
| fr | home_title | Accueil |
| en | home_title | Home |
| fr | upcoming_agenda | À venir |
| en | upcoming_agenda | Upcoming |
| all | email | hello@example.com |
| all | biography_img | https://res.cloudinary.com/... |

> `meta` is the catch-all tab for UI strings, biography text, and language-independent values. The CSV-to-YAML script groups rows by `lang`, producing `site.data.meta.fr`, `site.data.meta.en`, and `site.data.meta.all`.

---

## Step 3 — Publish Each Sheet Tab

For **each tab**:

1. **File > Share > Publish to the web**
2. Select the tab name from the dropdown
3. Format: `Comma-separated values (.csv)`
4. Click **Publish** and copy the URL

Each URL looks like:
```
https://docs.google.com/spreadsheets/d/e/SPREADSHEET_ID/pub?gid=TAB_GID&single=true&output=csv
```

Save all URLs — you will need them in Step 4.

---

## Step 4 — Add Secrets to GitHub

In your repo: **Settings > Secrets and variables > Actions > New repository secret**.

Add one secret per tab:

| Secret name | Value |
|---|---|
| `SHEET_AGENDA_URL` | CSV URL for the `agenda` tab |
| `SHEET_META_URL` | CSV URL for the `meta` tab |

---

## Step 5 — Create `sheets.yml` (the central config)

```yaml
sheets:
  - name: agenda
    secret: SHEET_AGENDA_URL
    sort_by: date

  - name: meta
    secret: SHEET_META_URL
```

**To add a new data source later** (e.g. `projects`):
1. Add a new tab to the Sheet, publish it, add a `SHEET_PROJECTS_URL` secret
2. Add one entry to `sheets.yml` — done. No script changes needed.

---

## Step 6 — Install jekyll-polyglot

1. Open `Gemfile` and add:
   ```ruby
   gem "jekyll-polyglot"
   ```

2. Open `_config.yml` and add:
   ```yaml
   plugins:
     - jekyll-polyglot

   languages: ["fr", "en", "ja"]
   default_lang: "fr"
   exclude_from_localizations: ["assets", "images", "_data"]
   ```

3. Add the language switcher to your theme's header template (see the real implementation in `_includes/header.html`):
   ```liquid
   {%- for lang in site.languages -%}
     {%- if lang == site.active_lang -%}
       <strong>{{ lang | upcase }}</strong>
     {%- else -%}
       {% capture lang_href %}{% if lang != site.default_lang %}/{{ lang }}{% endif %}{{ page.url }}{% endcapture %}
       <a {% static_href %}href="{{ lang_href }}"{% endstatic_href %}>{{ lang | upcase }}</a>
     {%- endif -%}
   {%- endfor -%}
   ```

   > `{% static_href %}` is a polyglot tag that prevents the plugin from rewriting the URL — required for the switcher to work correctly.

---

## Step 7 — Write Templates (once per page, all languages)

Create one file per page under `_pages/`. The plugin sets `site.active_lang` automatically from the URL. You never duplicate page files.

**`_pages/index.html`:**
```liquid
---
layout: default
title: Accueil
permalink: /
---

{% assign t = site.data.meta[site.active_lang] %}
{% assign events = site.data.agenda[site.active_lang] %}
{% assign today = 'now' | date: "%Y-%m-%d" %}

<h1>{{ t.home_title }}</h1>

<section>
  <h2>{{ t.upcoming_agenda }}</h2>
  {% for event in events %}
    {% if event.date >= today %}
      <h3>{{ event.title }}</h3>
      <p>{{ event.date }} — {{ event.location }}</p>
    {% endif %}
  {% endfor %}
</section>
```

**`_pages/agenda.html`:**
```liquid
---
layout: default
title: Agenda
permalink: /agenda/
---

{% assign t = site.data.meta[site.active_lang] %}
{% assign events = site.data.agenda[site.active_lang] %}
{% assign today = 'now' | date: "%Y-%m-%d" %}

{% for event in events %}
  <div class="event">
    <p>{{ event.date }}{% if event.time != "" %} · {{ event.time }}{% endif %}</p>
    <h2>{{ event.title }}</h2>
    <p>{{ event.description }}</p>
    {% if event.link != "" %}
      <a href="{{ event.link }}">{{ t.agenda_more_info }} &rarr;</a>
    {% endif %}
  </div>
{% endfor %}
```

> See the actual templates in `_pages/` for the full implementation (year tabs, upcoming/past split, biography section).

---

## Step 8 — Add the GitHub Action

Create `.github/workflows/update-site.yml`:

```yaml
name: Update site from Google Sheet

on:
  schedule:
    - cron: '0 6 * * *'   # Every day at 06:00 UTC
  workflow_dispatch:        # Manual trigger from the Actions tab

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Download CSVs from Google Sheets
        run: node .github/scripts/download-csvs.js
        env:
          SHEETS_CONFIG: sheets.yml
          SHEET_AGENDA_URL: ${{ secrets.SHEET_AGENDA_URL }}
          SHEET_META_URL: ${{ secrets.SHEET_META_URL }}

      - name: Convert CSVs to YAML
        run: node .github/scripts/csv-to-yaml.js

      - name: Build Jekyll site
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

> When you add a new data source, add its `SHEET_XXX_URL` secret and one line under `env:`.

---

## Step 9 — Add the Scripts

See the actual implementations in `.github/scripts/`. Both scripts read `sheets.yml` and contain no hardcoded page names.

- **`download-csvs.js`** — downloads each CSV using the secret name from `sheets.yml`
- **`csv-to-yaml.js`** — converts CSVs to YAML, grouping rows by `lang`; respects `sort_by` and `group_by` from `sheets.yml`

---

## Step 10 — Upload Images to Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com/) (free tier: 25GB storage).
2. In the dashboard go to **Media Library > Upload**.
3. Once uploaded, click the image and copy its URL:
   ```
   https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123456/photo.jpg
   ```
4. Paste that URL into the `content` or `image` column of your Google Sheet.

**Optional — resize on the fly** (saves bandwidth, no extra storage):
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_800/photo.jpg
```

---

## Local Development

All tasks run through Docker — do not run Jekyll or Node directly.

```bash
make build        # build the Docker image (once, or after Gemfile changes)
make up           # start Jekyll dev server at http://localhost:4000
make sheets       # download CSVs from Sheets and convert to _data/*.yml
make test-sheets  # check connectivity to all sheet URLs in .env
make down         # stop containers
make clean        # remove generated _data files
make logs         # tail Jekyll server logs
make shell        # open a shell inside the Jekyll container
```

Copy `.env.example` to `.env` and fill in your sheet URLs before running `make up` or `make sheets`.

---

## Day-to-Day Workflow

| You want to... | Action |
|---|---|
| Edit text | Edit the Google Sheet cell |
| Add an agenda event | Add one row per language in the `agenda` tab |
| Add a photo | Upload to Cloudinary, copy URL, paste into Sheet |
| Force an immediate rebuild | Actions tab > **Update site from Google Sheet** > **Run workflow** |
| Change rebuild schedule | Edit `cron` in `.github/workflows/update-site.yml` |
| Add a new data source | Add a tab → publish → add secret → add entry in `sheets.yml` |
| Add a new language | Add to `languages` in `_config.yml`; add rows in Sheet with the new `lang` value |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Site not updating | Check the **Actions** tab for error logs |
| CSV download fails | Re-publish the sheet tab; verify the secret URL hasn't changed |
| `Missing secret: SHEET_XXX_URL` | Add the secret in GitHub and the matching `env:` line in the workflow |
| Jekyll build fails | Run `make shell` then `bundle install`; check `Gemfile` matches the theme |
| Images not showing | Use the direct Cloudinary URL (ends in `.jpg`/`.png`), not the dashboard page URL |
| Language switcher broken | Use `{% static_href %}href="..."{% endstatic_href %}` — polyglot rewrites plain `href` attributes |
| Agenda not sorted | Dates must be `YYYY-MM-DD` — other formats will not sort correctly |
| `js-yaml not found` | Run `npm install` in the repo root |
| `site.active_lang` is empty | Confirm `jekyll-polyglot` is in both `Gemfile` and `_config.yml` plugins list |

---

## Useful Links

- Jekyll docs: https://jekyllrb.com/docs/
- jekyll-polyglot docs: https://polyglot.untra.io/
- Free Jekyll themes: https://jekyllthemes.io/free
- Cloudinary dashboard: https://cloudinary.com/console
- GitHub Actions cron syntax: https://crontab.guru/
