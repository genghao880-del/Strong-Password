#!/usr/bin/env node

/**
 * Custom deploy script for Cloudflare Pages
 * This script deploys only the necessary files, excluding node_modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files and directories to deploy
const filesToDeploy = [
  'index.html',
  'App.tsx',
  'index.tsx',
  'constants.tsx',
  'types.ts',
  'functions/',
  'schema.sql',
  'wrangler.toml',
];

// Create a temporary directory for deployment
const tempDir = path.join(process.cwd(), '.deploy-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Copy only necessary files
filesToDeploy.forEach((file) => {
  const src = path.join(process.cwd(), file);
  const dest = path.join(tempDir, file);

  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      // Copy directory recursively
      copyDir(src, dest);
    } else {
      // Copy file
      fs.copyFileSync(src, dest);
    }
  }
});

// Deploy from temp directory
try {
  console.log('Deploying to Cloudflare Pages...');
  execSync(`npx wrangler pages deploy ${tempDir}`, { stdio: 'inherit' });
  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
} finally {
  // Cleanup temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
}

// Helper function to copy directories recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
