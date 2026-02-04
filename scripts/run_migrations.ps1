# run_migrations.ps1
# PowerShell script to run SQL migrations using $env:DATABASE_URL

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL environment variable is not set. Set it first (or load from .env)."
  exit 1
}

# Check if psql exists
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Error "psql not found in PATH. Install PostgreSQL client tools or add psql to PATH."
  exit 2
}

$scriptPath = Join-Path $PSScriptRoot "create_tables.sql"
if (-not (Test-Path $scriptPath)) {
  Write-Error "Migration file not found: $scriptPath"
  exit 3
}

Write-Host "Running migrations using DATABASE_URL..."
psql $env:DATABASE_URL -f $scriptPath
if ($LASTEXITCODE -ne 0) {
  Write-Error "psql returned exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Migrations completed."
