# Script de ejecución para el proyecto Flow (Monorepo)

Write-Host "==> Verificando puertos ocupados (7127 y 7117)..." -ForegroundColor Cyan

$ports = @(7127, 7117)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -and $pidToKill -ne 0) {
                Write-Host "Liberando puerto $port (Cerrando proceso PID $pidToKill)..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "==> Verificando archivos de entorno..." -ForegroundColor Cyan

if (-not (Test-Path "apps/reader/.env.local")) {
    Write-Host "Creando apps/reader/.env.local desde .env.local.example..." -ForegroundColor Yellow
    Copy-Item "apps/reader/.env.local.example" "apps/reader/.env.local"
}

if (-not (Test-Path "apps/website/.env.local")) {
    Write-Host "Creando apps/website/.env.local desde .env.local.example..." -ForegroundColor Yellow
    Copy-Item "apps/website/.env.local.example" "apps/website/.env.local"
}

$env:RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = "false"

Write-Host "==> Arrancando el proyecto con pnpm dev..." -ForegroundColor Green
pnpm dev
