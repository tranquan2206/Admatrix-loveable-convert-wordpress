const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('converts the minimal static example into a WordPress child-theme bundle', () => {
  const projectRoot = path.resolve(__dirname, '..');
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'lovable-wp-'));
  const result = spawnSync(process.execPath, [
    path.join(projectRoot, 'scripts', 'convert-static.js'),
    '--input',
    path.join(projectRoot, 'examples', 'minimal-lovable'),
    '--slug',
    'demo-landing',
    '--name',
    'Demo Landing',
    '--output',
    output,
    '--force',
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);

  const content = fs.readFileSync(
    path.join(output, 'template-parts', 'demo-landing', 'content.php'),
    'utf8',
  );
  const enqueue = fs.readFileSync(
    path.join(output, 'functions-enqueue-demo-landing.php'),
    'utf8',
  );
  const report = JSON.parse(fs.readFileSync(
    path.join(output, 'conversion-report.json'),
    'utf8',
  ));

  assert.match(content, /get_theme_file_uri\('assets\/demo-landing\/source\/assets\/hero\.svg'\)/);
  assert.match(enqueue, /assets\/demo-landing\/source\/assets\/styles\.css/);
  assert.match(enqueue, /assets\/demo-landing\/source\/assets\/app\.js/);
  assert.equal(report.status, 'PASS_WITH_REVIEW');
  assert.deepEqual(report.missing_assets, []);
});

test('preserves external head dependencies and JSON-LD', () => {
  const projectRoot = path.resolve(__dirname, '..');
  const input = fs.mkdtempSync(path.join(os.tmpdir(), 'lovable-input-'));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'lovable-output-'));
  fs.writeFileSync(path.join(input, 'index.html'), `<!doctype html>
    <html><head>
      <link rel="stylesheet" href="https://cdn.example.com/site.css">
      <script type="application/ld+json">{"@type":"Organization"}</script>
      <script type="module" src="https://cdn.example.com/app.js"></script>
    </head><body><h1>Example</h1></body></html>`);

  const result = spawnSync(process.execPath, [
    path.join(projectRoot, 'scripts', 'convert-static.js'),
    '--input', input,
    '--slug', 'external-demo',
    '--output', output,
    '--force',
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  const content = fs.readFileSync(
    path.join(output, 'template-parts', 'external-demo', 'content.php'),
    'utf8',
  );
  const enqueue = fs.readFileSync(
    path.join(output, 'functions-enqueue-external-demo.php'),
    'utf8',
  );
  assert.match(content, /application\/ld\+json/);
  assert.match(enqueue, /https:\/\/cdn\.example\.com\/site\.css/);
  assert.match(enqueue, /https:\/\/cdn\.example\.com\/app\.js/);
  assert.match(enqueue, /script_loader_tag/);
});
