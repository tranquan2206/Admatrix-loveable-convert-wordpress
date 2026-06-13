# GitHub Setup

Target repository name:

```text
Admatrix-loveable-convert-wordpress
```

Recommended visibility: private company repository.

## Important Security Rule

Do not commit:

- GitHub PAT tokens.
- WordPress Application Passwords.
- `.env` files.
- Local credential JSON files.
- Client project exports under `input/`.
- Generated landing outputs under `output/`.

## GitHub URLs

Replace `<org-or-user>` after creating the repo:

```text
https://github.com/<org-or-user>/Admatrix-loveable-convert-wordpress
https://github.com/<org-or-user>/Admatrix-loveable-convert-wordpress/actions
https://github.com/<org-or-user>/Admatrix-loveable-convert-wordpress/settings/secrets/actions
https://github.com/<org-or-user>/Admatrix-loveable-convert-wordpress/issues
```

Related upstream docs:

```text
https://github.com/WordPress/mcp-adapter
https://github.com/Automattic/mcp-wordpress-remote
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
https://developer.wordpress.org/rest-api/
https://developer.wordpress.org/rest-api/reference/pages/
https://developer.wordpress.org/rest-api/reference/media/
https://docs.uxthemes.com/article/40-page-templates
https://elementor.com/help/canvas-template/
```

## Create And Push With GitHub CLI

Use the token only as an environment variable for the current terminal session.

```powershell
cd F:\Agent_Home\Tools\Admatrix-loveable-convert-wordpress
git init
git add .
git commit -m "Initial Admatrix Lovable to WordPress converter"

$env:GH_TOKEN = "<paste-token-for-this-session-only>"
gh repo create <org-or-user>/Admatrix-loveable-convert-wordpress --private --source . --remote origin --push
Remove-Item Env:GH_TOKEN
```

If the repo already exists:

```powershell
git remote add origin https://github.com/<org-or-user>/Admatrix-loveable-convert-wordpress.git
git branch -M main
git push -u origin main
```

## GitHub Actions

The included workflow runs:

```powershell
npm install
npm test
```

Do not store production WordPress credentials in GitHub Actions unless the team agrees to automated deployment.
