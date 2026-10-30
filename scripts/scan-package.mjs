#!/usr/bin/env node
// Runs the checks of n8n's community package scanner (@n8n/scan-community-package)
// before the package is published. The official CLI only scans packages already on npm
// (and their provenance), so this script packs the package with `npm pack` and runs the
// scanner's own analysis on the tarball and on the sources, the same two passes the CLI does.
//
// Usage: SCANNER_DIR=<folder with @n8n/scan-community-package installed> node scripts/scan-package.mjs
//   npm install --prefix "$SCANNER_DIR" --ignore-scripts @n8n/scan-community-package

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const scannerDir = process.env.SCANNER_DIR;
if (!scannerDir) {
	console.error('Set SCANNER_DIR to a folder with @n8n/scan-community-package installed.');
	process.exit(2);
}

const scannerModule = path.join(
	scannerDir,
	'node_modules',
	'@n8n',
	'scan-community-package',
	'scanner',
	'scanner.mjs',
);
const { analyzePackage, SOURCE_FILE_PATTERNS } = await import(pathToFileURL(scannerModule).href);

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'n8n-scan-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tarball = execFileSync(npm, ['pack', '--pack-destination', work, '--silent'], {
	cwd: root,
	encoding: 'utf8',
	shell: process.platform === 'win32',
})
	.trim()
	.split('\n')
	.pop();
const packageDir = path.join(work, 'package');
// Relative path: GNU tar on Windows would read "C:" in an absolute path as a remote host.
execFileSync('tar', ['-xzf', tarball], { cwd: work });

const results = [
	['sources', await analyzePackage(root, SOURCE_FILE_PATTERNS)],
	['package (npm pack)', await analyzePackage(packageDir, ['**/*.js', 'package.json'])],
];

let failed = false;
for (const [label, result] of results) {
	console.log(
		`${result.passed ? '✅' : '❌'} ${label}${result.message ? `: ${result.message}` : ''}`,
	);
	if (result.details) console.log(result.details);
	failed ||= !result.passed;
}
fs.rmSync(work, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
