# iHYPE Deployment

GitHub is the production source of truth for code.

Production deploys must come from the committed GitHub `main` branch through `.github/workflows/deploy-production.yml`. Local checkouts are for editing, testing, and committing only; they are not a deployment source.

## Production Flow

1. Commit the change.
2. Push or merge it to GitHub `main`.
3. GitHub Actions checks out the exact pushed SHA.
4. The workflow runs Prisma generation, migrations, `npm run cf:build`, the Cloudflare Pages deploy, the cron Worker deploy, and production smoke checks when configured.

## Local Guardrail

`npm run cf:deploy` and `npm run cf:deploy:cron` intentionally refuse to run outside the GitHub Actions production workflow. This prevents a local working tree from publishing code that is not stored in GitHub.

To publish, push the committed code to GitHub `main` and let the workflow run.
