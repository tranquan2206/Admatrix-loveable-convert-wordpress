#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cheerio = require('cheerio');
const sharp = require('sharp');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) throw new Error(`Unexpected argument: ${item}`);
    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  npm run deploy:page -- --input <folder-or-index.html> --slug <slug> --title <title> --builder <flatsome|elementor|gutenberg>',
    '',
    'Options:',
    '  --credential <json>  Defaults to Agent_Home WordPress MCP credential.',
    '  --template <file>    Optional explicit WordPress template override.',
  ].join('\n');
}

function assertSlug(value) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value || '')) {
    throw new Error('Slug must contain lowercase letters, numbers, and single hyphens only.');
  }
}

function isRemoteOrSpecial(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|data:)/i.test(url || '');
}

function splitUrlSuffix(url) {
  const match = String(url).match(/^([^?#]*)(.*)$/);
  return { pathname: match[1], suffix: match[2] };
}

function mimeType(file) {
  const extension = path.extname(file).toLowerCase();
  return {
    '.avif': 'image/avif',
    '.css': 'text/css',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }[extension] || 'application/octet-stream';
}

function resolveLocal(rawUrl, sourceRoot, baseDir) {
  if (!rawUrl || isRemoteOrSpecial(rawUrl)) return null;
  const { pathname: urlPath, suffix } = splitUrlSuffix(rawUrl.trim());
  if (!urlPath) return null;
  let decoded = urlPath;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    // Keep the original path if it is not valid URI encoding.
  }
  const absolute = decoded.startsWith('/')
    ? path.resolve(sourceRoot, `.${decoded}`)
    : path.resolve(baseDir, decoded);
  const relative = path.relative(sourceRoot, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Asset escapes input folder: ${rawUrl}`);
  }
  return { absolute, relative, suffix };
}

async function wpRequest(url, credential, options = {}) {
  const auth = Buffer.from(`${credential.username}:${credential.application_password}`).toString('base64');
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`WordPress ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  return body;
}

function resolveTemplate(builder, explicitTemplate) {
  if (explicitTemplate) return explicitTemplate;
  return {
    flatsome: 'page-blank.php',
    elementor: 'elementor_canvas',
    gutenberg: '',
  }[builder];
}

function resolveSvgColor(svgMarkup) {
  const classMatch = svgMarkup.match(/\bclass=(["'])(.*?)\1/i);
  const classes = classMatch ? classMatch[2] : '';
  if (/\btext-white\b/.test(classes)) return '#ffffff';
  if (/\btext-(?:cyan|sky)-\d+\b/.test(classes)) return '#00a9e0';
  if (/\btext-(?:red|rose|orange)-\d+\b/.test(classes)) return '#f04438';
  if (/\btext-(?:slate|gray|zinc|neutral)-\d+\b/.test(classes)) return '#526071';
  return '#006bdc';
}

const animatedSvgStyle = `
<style>
svg{font-family:Geist,Arial,sans-serif}
@keyframes dash-flow{to{stroke-dashoffset:-200}}
.animate-dash{stroke-dasharray:6 8;animation:dash-flow 4s linear infinite}
@keyframes packet{0%{offset-distance:0%;opacity:0}10%,90%{opacity:1}100%{offset-distance:100%;opacity:0}}
.animate-packet{animation:packet 3.2s ease-in-out infinite}
@keyframes bar-rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.animate-bar{transform-box:fill-box;transform-origin:center bottom;animation:bar-rise 1.2s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes soft-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.04);opacity:.92}}
.animate-soft-pulse{transform-box:fill-box;transform-origin:center;animation:soft-pulse 3s ease-in-out infinite}
@keyframes draw-in{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}
.animate-draw{stroke-dasharray:800;animation:draw-in 2.4s ease-out forwards}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
.animate-blink{animation:blink 1.6s ease-in-out infinite}
</style>`;

function isAnimatedSvg(svgMarkup) {
  return /\banimate-(?:dash|packet|bar|soft-pulse|draw|blink)\b/.test(svgMarkup);
}

function embedAnimatedSvg(svgMarkup) {
  let svg = svgMarkup.includes('xmlns=')
    ? svgMarkup
    : svgMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  svg = svg.replace(/<svg([^>]*)>/, `<svg$1>${animatedSvgStyle}`);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.slug || !args.title || !args.builder) throw new Error(usage());
  if (!['flatsome', 'elementor', 'gutenberg'].includes(args.builder)) {
    throw new Error('--builder must be flatsome, elementor, or gutenberg.');
  }
  assertSlug(args.slug);
  const pageTemplate = resolveTemplate(args.builder, args.template);

  const credentialFile = path.resolve(
    args.credential || 'F:/Agent_Home/00_Raw_Assets/credentials/wordpress-admatrix-mcp.json',
  );
  const credential = JSON.parse(fs.readFileSync(credentialFile, 'utf8'));
  const siteRoot = new URL(credential.api_url).origin;
  const inputPath = path.resolve(args.input);
  const isDirectory = fs.statSync(inputPath).isDirectory();
  const htmlFile = isDirectory ? path.join(inputPath, 'index.html') : inputPath;
  const sourceRoot = isDirectory ? inputPath : path.dirname(inputPath);
  const htmlDir = path.dirname(htmlFile);
  const $ = cheerio.load(fs.readFileSync(htmlFile, 'utf8'), { decodeEntities: false });
  const uploadCache = new Map();
  const uploaded = [];
  const warnings = [];

  async function uploadAsset(asset) {
    const key = path.resolve(asset.absolute);
    if (uploadCache.has(key)) return `${uploadCache.get(key)}${asset.suffix}`;
    if (!fs.existsSync(asset.absolute) || !fs.statSync(asset.absolute).isFile()) {
      throw new Error(`Missing local asset: ${asset.relative}`);
    }

    const extension = path.extname(asset.absolute).toLowerCase();
    if (['.svg', '.woff', '.woff2'].includes(extension)) {
      const dataUrl = `data:${mimeType(asset.absolute)};base64,${fs.readFileSync(asset.absolute).toString('base64')}`;
      uploadCache.set(key, dataUrl);
      return `${dataUrl}${asset.suffix}`;
    }

    const fileName = `${args.slug}-${path.basename(asset.absolute)}`;
    const body = fs.readFileSync(asset.absolute);
    const media = await wpRequest(`${siteRoot}/wp-json/wp/v2/media`, credential, {
      method: 'POST',
      headers: {
        'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"`,
        'Content-Type': mimeType(asset.absolute),
      },
      body,
    });
    uploadCache.set(key, media.source_url);
    uploaded.push({ id: media.id, source: asset.relative, url: media.source_url });
    return `${media.source_url}${asset.suffix}`;
  }

  async function uploadBuffer(buffer, fileName, contentType, source) {
    const media = await wpRequest(`${siteRoot}/wp-json/wp/v2/media`, credential, {
      method: 'POST',
      headers: {
        'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"`,
        'Content-Type': contentType,
      },
      body: buffer,
    });
    uploaded.push({ id: media.id, source, url: media.source_url });
    return media.source_url;
  }

  async function rewriteCss(css, baseDir) {
    const matches = [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)];
    let output = css;
    for (const match of matches) {
      const asset = resolveLocal(match[2], sourceRoot, baseDir);
      if (!asset) continue;
      const remote = await uploadAsset(asset);
      output = output.replace(match[0], `url("${remote}")`);
    }
    return output;
  }

  const cssBlocks = [];
  for (const element of $('head link[rel~="stylesheet"][href]').toArray()) {
    const href = $(element).attr('href');
    const asset = resolveLocal(href, sourceRoot, htmlDir);
    if (!asset) {
      warnings.push(`External stylesheet retained: ${href}`);
      continue;
    }
    const css = fs.readFileSync(asset.absolute, 'utf8');
    cssBlocks.push(await rewriteCss(css, path.dirname(asset.absolute)));
    $(element).remove();
  }

  for (const element of $('head style').toArray()) {
    cssBlocks.push(await rewriteCss($(element).html() || '', htmlDir));
    $(element).remove();
  }

  const jsBlocks = [];
  for (const element of $('script').toArray()) {
    const node = $(element);
    const type = (node.attr('type') || '').toLowerCase();
    if (type === 'application/ld+json') continue;
    const src = node.attr('src');
    if (!src) {
      if ((node.html() || '').trim()) jsBlocks.push(node.html().trim());
      node.remove();
      continue;
    }
    const asset = resolveLocal(src, sourceRoot, htmlDir);
    if (!asset) {
      warnings.push(`External script retained in markup: ${src}`);
      continue;
    }
    jsBlocks.push(fs.readFileSync(asset.absolute, 'utf8'));
    node.remove();
  }

  const inlineSvgCache = new Map();
  for (const element of $('body svg').toArray()) {
    const node = $(element);
    const originalSvg = $.html(element);
    if (isAnimatedSvg(originalSvg)) {
      const attributes = element.attribs || {};
      const image = $('<img>');
      for (const attribute of ['class', 'style', 'width', 'height', 'aria-hidden', 'role']) {
        if (attributes[attribute]) image.attr(attribute, attributes[attribute]);
      }
      image.attr({
        src: embedAnimatedSvg(originalSvg),
        alt: '',
        decoding: 'async',
        'data-lovable-live-svg': attributes.viewBox || 'animated',
      });
      node.replaceWith(image);
      continue;
    }

    const resolvedSvg = originalSvg.replaceAll('currentColor', resolveSvgColor(originalSvg));
    const hash = crypto.createHash('sha256').update(resolvedSvg).digest('hex').slice(0, 12);
    let remote = inlineSvgCache.get(hash);
    if (!remote) {
      const webp = await sharp(Buffer.from(resolvedSvg), { density: 192 }).webp({ quality: 90 }).toBuffer();
      remote = await uploadBuffer(
        webp,
        `${args.slug}-inline-svg-${hash}.webp`,
        'image/webp',
        `inline-svg:${hash}`,
      );
      inlineSvgCache.set(hash, remote);
    }
    const attributes = element.attribs || {};
    const image = $('<img>');
    for (const attribute of ['class', 'style', 'width', 'height', 'aria-hidden', 'role']) {
      if (attributes[attribute]) image.attr(attribute, attributes[attribute]);
    }
    image.attr({ src: remote, alt: '', decoding: 'async' });
    node.replaceWith(image);
  }

  async function rewriteAttribute(element, attribute) {
    const node = $(element);
    const asset = resolveLocal(node.attr(attribute), sourceRoot, htmlDir);
    if (asset) node.attr(attribute, await uploadAsset(asset));
  }

  for (const element of $('[src]').toArray()) await rewriteAttribute(element, 'src');
  for (const element of $('[poster]').toArray()) await rewriteAttribute(element, 'poster');

  for (const element of $('[srcset]').toArray()) {
    const node = $(element);
    const candidates = node.attr('srcset').split(',');
    const rewritten = [];
    for (const candidate of candidates) {
      const match = candidate.trim().match(/^(\S+)(\s+.+)?$/);
      if (!match) {
        rewritten.push(candidate);
        continue;
      }
      const asset = resolveLocal(match[1], sourceRoot, htmlDir);
      rewritten.push(asset ? `${await uploadAsset(asset)}${match[2] || ''}` : candidate.trim());
    }
    node.attr('srcset', rewritten.join(', '));
  }

  for (const element of $('[style]').toArray()) {
    const node = $(element);
    node.attr('style', await rewriteCss(node.attr('style'), htmlDir));
  }

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && !isRemoteOrSpecial(href) && /\.html?(?:[?#].*)?$/i.test(href)) {
      warnings.push(`Local HTML link needs WordPress mapping: ${href}`);
    }
  });

  const scopedCss = cssBlocks.length
    ? `<style id="lovable-page-${args.slug}-styles">\n${cssBlocks.join('\n\n')}\n</style>`
    : '';
  const isolationCss = [
    `<style id="lovable-page-${args.slug}-isolation">`,
    'html,body{margin:0!important;padding:0!important}',
    ...(args.builder === 'flatsome'
      ? ['body #main,body #content,body .page-wrapper{margin:0!important;padding:0!important}']
      : []),
    `#lovable-page-${args.slug}{width:100%;max-width:none;overflow-x:hidden}`,
    `#lovable-page-${args.slug},#lovable-page-${args.slug} *{box-sizing:border-box}`,
    `#lovable-page-${args.slug} a{color:inherit;text-decoration:none}`,
    `#lovable-page-${args.slug} img{visibility:visible;opacity:1}`,
    '</style>',
  ].join('\n');
  const scripts = jsBlocks.length
    ? `<script id="lovable-page-${args.slug}-scripts">\n${jsBlocks.join('\n\n')}\n</script>`
    : '';
  const content = [
    isolationCss,
    scopedCss,
    `<div id="lovable-page-${args.slug}" class="lovable-page lovable-page-${args.slug}">`,
    ($('body').html() || '').trim(),
    '</div>',
    scripts,
  ].filter(Boolean).join('\n');

  const page = await wpRequest(`${siteRoot}/wp-json/wp/v2/pages`, credential, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      title: args.title,
      slug: args.slug,
      status: 'draft',
      template: pageTemplate,
      content,
    }),
  });

  const verify = await wpRequest(
    `${siteRoot}/wp-json/wp/v2/pages/${page.id}?context=edit`,
    credential,
  );
  if (verify.status !== 'draft' || verify.template !== pageTemplate) {
    throw new Error(`Page verification failed for ID ${page.id}`);
  }

  console.log(JSON.stringify({
    status: 'DEPLOYED_DRAFT',
    page_id: page.id,
    title: verify.title.raw,
    slug: verify.slug,
    builder: args.builder,
    template: verify.template,
    edit_url: `${siteRoot}/wp-admin/post.php?post=${page.id}&action=edit`,
    preview_url: page.link,
    uploaded_media: uploaded,
    warnings,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
