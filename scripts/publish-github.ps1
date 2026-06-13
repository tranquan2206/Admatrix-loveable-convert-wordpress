param(
  [Parameter(Mandatory = $true)]
  [string]$RepoFullName,

  [switch]$Public
)

if (-not $env:GH_TOKEN) {
  throw "Set GH_TOKEN for this terminal session first. Do not write the token into files."
}

$ErrorActionPreference = "Stop"
$visibility = if ($Public) { "--public" } else { "--private" }

if (-not (Test-Path -LiteralPath ".git")) {
  git init
}

git add .
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "Initial Admatrix Lovable to WordPress converter"
}

git branch -M main

$repoExists = $false
try {
  gh repo view $RepoFullName | Out-Null
  $repoExists = $true
} catch {
  $repoExists = $false
}

if (-not $repoExists) {
  gh repo create $RepoFullName $visibility --source . --remote origin --push
} else {
  $remote = git remote
  if ($remote -notcontains "origin") {
    git remote add origin "https://github.com/$RepoFullName.git"
  }
  git push -u origin main
}

Write-Host "Published: https://github.com/$RepoFullName"
