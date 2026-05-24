#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const phase = process.argv[2] ?? 'deploy';
const expectedRepo = 'colinatwood/ihype';
const expectedRef = 'refs/heads/main';
const errors = [];

if (process.env.GITHUB_ACTIONS !== 'true') {
  errors.push('production deploys must run from GitHub Actions, not a local checkout');
}

if (process.env.IHYPE_GITHUB_DEPLOY !== '1') {
  errors.push('IHYPE_GITHUB_DEPLOY=1 is required so only the production deploy workflow can publish');
}

if (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY !== expectedRepo) {
  errors.push(`expected GitHub repository ${expectedRepo}, got ${process.env.GITHUB_REPOSITORY}`);
}

if (process.env.GITHUB_REF && process.env.GITHUB_REF !== expectedRef) {
  errors.push(`expected ${expectedRef}, got ${process.env.GITHUB_REF}`);
}

if (process.env.GITHUB_EVENT_NAME && process.env.GITHUB_EVENT_NAME !== 'push') {
  errors.push(`expected push event, got ${process.env.GITHUB_EVENT_NAME}`);
}

if (process.env.GITHUB_SHA) {
  try {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (head !== process.env.GITHUB_SHA) {
      errors.push(`checked-out commit ${head} does not match GitHub event commit ${process.env.GITHUB_SHA}`);
    }
  } catch (error) {
    errors.push(`could not verify checked-out Git commit: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (errors.length > 0) {
  console.error(`[ihype] Refusing ${phase}. GitHub is the production source of truth.`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error('Push committed code to GitHub main and let .github/workflows/deploy-production.yml deploy it.');
  process.exit(1);
}

console.log(`[ihype] GitHub source verified for ${phase}: ${process.env.GITHUB_REPOSITORY}@${process.env.GITHUB_SHA}`);
