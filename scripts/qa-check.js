#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const output = path.resolve(process.argv[2] || '');
if (!process.argv[2]) {
  console.error('Usage: npm run qa -- <output-folder>');
  process.exit(1);
}

const reportFile = path.join(output, 'conversion-report.json');
if (!fs.existsSync(reportFile)) {
  console.error(`Missing conversion report: ${reportFile}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const required = [
  path.join(output, 'INSTALL.md'),
  path.join(output, `functions-enqueue-${report.campaign}.php`),
  path.join(output, 'page-templates', `page-${report.campaign}.php`),
  path.join(output, 'template-parts', report.campaign, 'content.php'),
];

const missingFiles = required.filter((file) => !fs.existsSync(file));
if (missingFiles.length > 0 || report.missing_assets.length > 0) {
  console.error(JSON.stringify({
    status: 'FAIL',
    missing_files: missingFiles,
    missing_assets: report.missing_assets,
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS_WITH_REVIEW',
  campaign: report.campaign,
  warnings: report.warnings,
  note: 'Automated structural QA passed. WordPress staging QA is still required.',
}, null, 2));
