#!/usr/bin/env node

/**
 * Theme Color Fixer
 * Automatically replaces hardcoded color classes with CSS variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Replacement mappings
const REPLACEMENTS = [
  // Text colors
  { from: /\btext-white\b/g, to: 'text-[var(--text-primary)]' },
  { from: /\btext-black\b/g, to: 'text-[var(--text-primary)]' },
  { from: /\btext-gray-300\b/g, to: 'text-[var(--text-secondary)]' },
  { from: /\btext-gray-400\b/g, to: 'text-[var(--text-secondary)]' },
  { from: /\btext-gray-500\b/g, to: 'text-[var(--text-muted)]' },
  { from: /\btext-gray-600\b/g, to: 'text-[var(--text-muted)]' },
  { from: /\btext-gray-700\b/g, to: 'text-[var(--text-muted)]' },

  // Background colors
  { from: /\bbg-white\b(?!\/)/g, to: 'bg-[var(--bg-primary)]' },  // Not bg-white/opacity
  { from: /\bbg-black\b(?!\/)/g, to: 'bg-[var(--bg-primary)]' },
  { from: /\bbg-gray-800\b(?!\/)/g, to: 'bg-[var(--bg-secondary)]' },
  { from: /\bbg-gray-900\b(?!\/)/g, to: 'bg-[var(--bg-primary)]' },

  // Border colors
  { from: /\bborder-white\b(?!\/)/g, to: 'border-[var(--divider)]' },
  { from: /\bborder-gray-700\b/g, to: 'border-[var(--divider)]' },
  { from: /\bborder-gray-800\b/g, to: 'border-[var(--divider)]' },
];

// Files/directories to scan
const SCAN_DIRS = ['src/components', 'src/pages', 'src/layouts'];
const EXTENSIONS = ['.tsx', '.jsx', '.astro', '.ts', '.js'];

// Files to ignore
const IGNORE_FILES = [
  'ThemeToggle.tsx',
];

function getAllFiles(dir, files = []) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return files;

  const items = fs.readdirSync(fullDir);
  for (const item of items) {
    const fullPath = path.join(fullDir, item);
    const relativePath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(relativePath, files);
    } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
      if (!IGNORE_FILES.includes(item)) {
        files.push({ fullPath, relativePath });
      }
    }
  }
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changes = 0;

  for (const { from, to } of REPLACEMENTS) {
    const matches = content.match(from);
    if (matches) {
      changes += matches.length;
      content = content.replace(from, to);
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return changes;
}

function main() {
  console.log('🔧 Auto-fixing hardcoded theme colors...\n');

  let totalChanges = 0;
  let filesChanged = 0;

  for (const dir of SCAN_DIRS) {
    const files = getAllFiles(dir);
    for (const { fullPath, relativePath } of files) {
      const changes = fixFile(fullPath);
      if (changes > 0) {
        console.log(`📁 ${relativePath}: ${changes} changes`);
        totalChanges += changes;
        filesChanged++;
      }
    }
  }

  console.log('');
  if (totalChanges === 0) {
    console.log('✅ No changes needed - all colors are already using CSS variables!');
  } else {
    console.log(`✅ Fixed ${totalChanges} color(s) in ${filesChanged} file(s)`);
    console.log('\n⚠️  Please review the changes and test both light and dark modes!');
  }
}

main();
