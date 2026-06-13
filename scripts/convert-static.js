#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      throw new Error(`Unexpected argument: ${item}`);
    }
    const key = item.slice(2);
    if (key === 'force') {
      args.force = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  npm run convert -- --input <folder-or-index.html> --slug <campaign-slug> [options]',
    '',
    'Options:',
    '  --name <campaign name>  WordPress template name. Defaults to slug.',
    '  --output <folder>        Output folder. Defaults to output/<slug>.',
    '  --force                  Replace an existing output folder.',
  ].join('\n');
}

function assertSlug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value || '')) {
    throw new Error('Slug must contain lowercase letters, numbers, and single hyphens only.');
  }
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function escapePhpSingle(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isRemoteOrSpecial(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);
}

function splitUrlSuffix(url) {
  const match = url.match(/^([^?#]*)(.*)$/);
  return { pathname: match[1], suffix: match[2] };
}

function resolveLocalAsset(rawUrl, sourceRoot, htmlDir) {
  const url = rawUrl.trim();
  if (!url || isRemoteOrSpecial(url) || url.includes('<?php')) {
    return null;
  }

  const { pathname: urlPath, suffix } = splitUrlSuffix(url);
  if (!urlPath) {
    return null;
  }

  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    decoded = urlPath;
  }

  const absolute = decoded.startsWith('/')
    ? path.resolve(sourceRoot, `.${decoded}`)
    : path.resolve(htmlDir, decoded);
  const relative = path.relative(sourceRoot, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return { error: `Asset path escapes input folder: ${rawUrl}` };
  }

  return {
    absolute,
    relative: toPosix(relative),
    suffix,
  };
}

function phpThemeAsset(slug, relative, suffix = '') {
  const themePath = `assets/${slug}/source/${relative}`;
  return `<?php echo esc_url(get_theme_file_uri('${escapePhpSingle(themePath)}')); ?>${suffix}`;
}

function copyInputFiles(sourceRoot, htmlFile, assetRoot) {
  fs.cpSync(sourceRoot, assetRoot, {
    recursive: true,
    filter(source) {
      return path.resolve(source) !== path.resolve(htmlFile);
    },
  });
}

function rewriteCssUrls(css, context) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (full, quote, rawUrl) => {
    const asset = resolveLocalAsset(rawUrl, context.sourceRoot, context.baseDir);
    if (!asset) {
      return full;
    }
    if (asset.error) {
      context.warnings.add(asset.error);
      return full;
    }
    if (!fs.existsSync(asset.absolute)) {
      context.missingAssets.add(asset.relative);
    }

    const cssFileDir = path.dirname(context.outputCssFile);
    const copiedAsset = path.join(context.assetRoot, asset.relative);
    let relativeUrl = toPosix(path.relative(cssFileDir, copiedAsset));
    if (!relativeUrl.startsWith('.')) {
      relativeUrl = `./${relativeUrl}`;
    }
    return `url("${relativeUrl}${asset.suffix}")`;
  });
}

function buildEnqueuePhp({ slug, stylesheets, scripts, hasGeneratedCss, hasGeneratedJs }) {
  const lines = [
    '<?php',
    '/**',
    ` * Assets for the ${slug} landing page.`,
    ' * Add this file to the child theme and require it from functions.php.',
    ' */',
    '',
    "defined('ABSPATH') || exit;",
    '',
    "add_action('wp_enqueue_scripts', function () {",
    `    if (!is_page_template('page-templates/page-${slug}.php')) {`,
    '        return;',
    '    }',
  ];

  let styleIndex = 0;
  for (const stylesheet of stylesheets) {
    styleIndex += 1;
    const source = stylesheet.remote
      ? `'${escapePhpSingle(stylesheet.url)}'`
      : `get_theme_file_uri('assets/${slug}/source/${escapePhpSingle(stylesheet.path)}')`;
    const version = stylesheet.remote
      ? 'null'
      : `'${fs.statSync(path.join(stylesheets.sourceRoot, stylesheet.path)).mtimeMs}'`;
    lines.push(
      '',
      '    wp_enqueue_style(',
      `        '${slug}-source-${styleIndex}',`,
      `        ${source},`,
      '        [],',
      `        ${version}`,
      '    );',
    );
  }

  if (hasGeneratedCss) {
    lines.push(
      '',
      '    wp_enqueue_style(',
      `        '${slug}-generated',`,
      `        get_theme_file_uri('assets/${slug}/styles.css'),`,
      '        [],',
      `        '${Date.now()}'`,
      '    );',
    );
  }

  const moduleHandles = [];
  let scriptIndex = 0;
  for (const script of scripts) {
    scriptIndex += 1;
    const handle = `${slug}-source-${scriptIndex}`;
    const source = script.remote
      ? `'${escapePhpSingle(script.url)}'`
      : `get_theme_file_uri('assets/${slug}/source/${escapePhpSingle(script.path)}')`;
    const version = script.remote
      ? 'null'
      : `'${fs.statSync(path.join(scripts.sourceRoot, script.path)).mtimeMs}'`;
    lines.push(
      '',
      '    wp_enqueue_script(',
      `        '${handle}',`,
      `        ${source},`,
      '        [],',
      `        ${version},`,
      '        true',
      '    );',
    );
    if (script.type === 'module') {
      moduleHandles.push(handle);
    }
  }

  if (hasGeneratedJs) {
    lines.push(
      '',
      '    wp_enqueue_script(',
      `        '${slug}-generated',`,
      `        get_theme_file_uri('assets/${slug}/custom.js'),`,
      '        [],',
      `        '${Date.now()}',`,
      '        true',
      '    );',
    );
  }

  lines.push('}, 20);');

  if (moduleHandles.length > 0) {
    lines.push(
      '',
      "add_filter('script_loader_tag', function ($tag, $handle, $src) {",
      `    $module_handles = ${JSON.stringify(moduleHandles)};`,
      '    if (in_array($handle, $module_handles, true)) {',
      '        return sprintf(\'<script type="module" src="%s"></script>\' . "\\n", esc_url($src));',
      '    }',
      '    return $tag;',
      '}, 10, 3);',
    );
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.slug) {
    throw new Error(usage());
  }

  assertSlug(args.slug);
  const slug = args.slug;
  const campaignName = args.name || slug;
  const inputPath = path.resolve(args.input);
  const htmlFile = fs.statSync(inputPath).isDirectory()
    ? path.join(inputPath, 'index.html')
    : inputPath;

  if (!fs.existsSync(htmlFile)) {
    throw new Error(`Input HTML not found: ${htmlFile}`);
  }

  const sourceRoot = fs.statSync(inputPath).isDirectory()
    ? inputPath
    : path.dirname(htmlFile);
  const htmlDir = path.dirname(htmlFile);
  const outputRoot = path.resolve(args.output || path.join('output', slug));

  if (fs.existsSync(outputRoot)) {
    if (!args.force) {
      throw new Error(`Output exists: ${outputRoot}. Use --force to replace it.`);
    }
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }

  const assetRoot = path.join(outputRoot, 'assets', slug, 'source');
  const generatedAssetRoot = path.join(outputRoot, 'assets', slug);
  const partRoot = path.join(outputRoot, 'template-parts', slug);
  const pageRoot = path.join(outputRoot, 'page-templates');
  fs.mkdirSync(assetRoot, { recursive: true });
  fs.mkdirSync(partRoot, { recursive: true });
  fs.mkdirSync(pageRoot, { recursive: true });
  copyInputFiles(sourceRoot, htmlFile, assetRoot);

  const warnings = new Set();
  const missingAssets = new Set();
  const html = fs.readFileSync(htmlFile, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const title = $('title').first().text().trim() || campaignName;
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const stylesheets = [];
  stylesheets.sourceRoot = sourceRoot;
  const scripts = [];
  scripts.sourceRoot = sourceRoot;
  const generatedCss = [];
  const generatedJs = [];
  const jsonLd = [];

  $('head link[rel~="stylesheet"][href]').each((_, element) => {
    const href = $(element).attr('href');
    const asset = resolveLocalAsset(href, sourceRoot, htmlDir);
    if (!asset) {
      stylesheets.push({ remote: true, url: href });
      warnings.add(`External stylesheet is preserved as a runtime dependency: ${href}`);
      $(element).remove();
      return;
    }
    if (asset.error) {
      warnings.add(asset.error);
      return;
    }
    if (!fs.existsSync(asset.absolute)) {
      missingAssets.add(asset.relative);
      return;
    }
    stylesheets.push({ remote: false, path: asset.relative });
    $(element).remove();
  });

  $('head style').each((_, element) => {
    const css = $(element).html() || '';
    generatedCss.push(rewriteCssUrls(css, {
      sourceRoot,
      baseDir: htmlDir,
      outputCssFile: path.join(generatedAssetRoot, 'styles.css'),
      assetRoot,
      warnings,
      missingAssets,
    }));
    $(element).remove();
  });

  $('script').each((_, element) => {
    const node = $(element);
    const type = (node.attr('type') || '').toLowerCase();
    if (type === 'application/ld+json') {
      const schema = node.html();
      if (schema && schema.trim()) {
        jsonLd.push(schema.trim());
      }
      node.remove();
      return;
    }

    const src = node.attr('src');
    if (!src) {
      const code = node.html();
      if (code && code.trim()) {
        generatedJs.push(code.trim());
      }
      node.remove();
      return;
    }

    const asset = resolveLocalAsset(src, sourceRoot, htmlDir);
    if (!asset) {
      scripts.push({ remote: true, url: src, type });
      warnings.add(`External script is preserved as a runtime dependency: ${src}`);
      node.remove();
      return;
    }
    if (asset.error) {
      warnings.add(asset.error);
      return;
    }
    if (!fs.existsSync(asset.absolute)) {
      missingAssets.add(asset.relative);
      return;
    }
    scripts.push({ remote: false, path: asset.relative, type });
    node.remove();
  });

  const rewriteAttribute = (element, attribute) => {
    const node = $(element);
    const rawUrl = node.attr(attribute);
    const asset = resolveLocalAsset(rawUrl, sourceRoot, htmlDir);
    if (!asset) {
      return;
    }
    if (asset.error) {
      warnings.add(asset.error);
      return;
    }
    if (!fs.existsSync(asset.absolute)) {
      missingAssets.add(asset.relative);
    }
    node.attr(attribute, phpThemeAsset(slug, asset.relative, asset.suffix));
  };

  $('[src]').each((_, element) => rewriteAttribute(element, 'src'));
  $('[poster]').each((_, element) => rewriteAttribute(element, 'poster'));

  $('[srcset]').each((_, element) => {
    const node = $(element);
    const rewritten = node.attr('srcset').split(',').map((candidate) => {
      const match = candidate.trim().match(/^(\S+)(\s+.+)?$/);
      if (!match) {
        return candidate;
      }
      const asset = resolveLocalAsset(match[1], sourceRoot, htmlDir);
      if (!asset || asset.error) {
        if (asset && asset.error) warnings.add(asset.error);
        return candidate.trim();
      }
      if (!fs.existsSync(asset.absolute)) {
        missingAssets.add(asset.relative);
      }
      return `${phpThemeAsset(slug, asset.relative, asset.suffix)}${match[2] || ''}`;
    }).join(', ');
    node.attr('srcset', rewritten);
  });

  $('[style]').each((_, element) => {
    const node = $(element);
    const style = node.attr('style');
    const rewritten = style.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (full, quote, rawUrl) => {
      const asset = resolveLocalAsset(rawUrl, sourceRoot, htmlDir);
      if (!asset || asset.error) {
        if (asset && asset.error) warnings.add(asset.error);
        return full;
      }
      if (!fs.existsSync(asset.absolute)) {
        missingAssets.add(asset.relative);
      }
      return `url('${phpThemeAsset(slug, asset.relative, asset.suffix)}')`;
    });
    node.attr('style', rewritten);
  });

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && !isRemoteOrSpecial(href) && /\.html?(?:[?#].*)?$/i.test(href)) {
      warnings.add(`Internal HTML link requires manual WordPress URL mapping: ${href}`);
    }
  });

  const schemaMarkup = jsonLd
    .map((schema) => `<script type="application/ld+json">\n${schema}\n</script>`)
    .join('\n');
  const bodyContent = [$('body').html() || '', schemaMarkup].filter(Boolean).join('\n');
  const contentPhp = [
    '<?php',
    '/**',
    ` * Converted body markup for ${campaignName}.`,
    ' */',
    "defined('ABSPATH') || exit;",
    '?>',
    `<main id="lovable-landing-${slug}" class="lovable-landing lovable-landing-${slug}">`,
    bodyContent.trim(),
    '</main>',
    '',
  ].join('\n');

  const pageTemplate = [
    '<?php',
    '/**',
    ` * Template Name: Landing Page - ${campaignName}`,
    ' * Template Post Type: page',
    ' */',
    "defined('ABSPATH') || exit;",
    '?><!doctype html>',
    '<html <?php language_attributes(); ?>>',
    '<head>',
    '    <meta charset="<?php bloginfo(\'charset\'); ?>">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1">',
    '    <?php wp_head(); ?>',
    '</head>',
    `<body <?php body_class('lovable-landing-page lovable-landing-page-${slug}'); ?>>`,
    '<?php',
    'wp_body_open();',
    `get_template_part('template-parts/${slug}/content');`,
    'wp_footer();',
    '?>',
    '</body>',
    '</html>',
    '',
  ].join('\n');

  if (generatedCss.length > 0) {
    fs.writeFileSync(path.join(generatedAssetRoot, 'styles.css'), `${generatedCss.join('\n\n')}\n`);
  }
  if (generatedJs.length > 0) {
    fs.writeFileSync(path.join(generatedAssetRoot, 'custom.js'), `${generatedJs.join('\n\n')}\n`);
  }

  fs.writeFileSync(path.join(partRoot, 'content.php'), contentPhp);
  fs.writeFileSync(path.join(pageRoot, `page-${slug}.php`), pageTemplate);
  fs.writeFileSync(
    path.join(outputRoot, `functions-enqueue-${slug}.php`),
    buildEnqueuePhp({
      slug,
      stylesheets,
      scripts,
      hasGeneratedCss: generatedCss.length > 0,
      hasGeneratedJs: generatedJs.length > 0,
    }),
  );

  const install = [
    `# Install ${campaignName}`,
    '',
    '1. Copy `assets/`, `template-parts/`, and `page-templates/` into the active child theme.',
    `2. Copy \`functions-enqueue-${slug}.php\` into the child theme root.`,
    `3. Add \`require_once get_stylesheet_directory() . '/functions-enqueue-${slug}.php';\` to the child theme \`functions.php\`.`,
    `4. In WordPress staging, create a page and select **Landing Page - ${campaignName}**.`,
    '5. Review visual output, links, forms, tracking, mobile behavior, and console errors before publishing.',
    '',
    'This output is a draft. The converter does not publish or modify WordPress.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outputRoot, 'INSTALL.md'), install);

  const seo = [
    `# RankMath draft for ${campaignName}`,
    '',
    `- SEO title: ${title}`,
    `- Meta description: ${metaDescription || '[Add manually]'}`,
    '- Canonical URL: [Set after the staging/production URL is known]',
    '- Open Graph image: [Review manually]',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outputRoot, 'rankmath-seo-draft.md'), seo);

  const report = {
    status: missingAssets.size === 0 ? 'PASS_WITH_REVIEW' : 'PARTIAL',
    input: htmlFile,
    output: outputRoot,
    campaign: slug,
    stylesheets,
    scripts,
    generated_css: generatedCss.length > 0,
    generated_js: generatedJs.length > 0,
    missing_assets: [...missingAssets],
    warnings: [...warnings],
    limitations: [
      'Static HTML export or built dist only; raw React/TypeScript source is not compiled.',
      'Visual fidelity, forms, tracking, and interactions still require staging QA.',
      'The converter preserves body structure and does not infer semantic template sections.',
    ],
  };
  fs.writeFileSync(path.join(outputRoot, 'conversion-report.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Converted ${htmlFile}`);
  console.log(`Output: ${outputRoot}`);
  console.log(`Status: ${report.status}`);
  console.log(`Warnings: ${report.warnings.length}; missing assets: ${report.missing_assets.length}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
