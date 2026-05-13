# Script de Arranque para RutaSegura

Write-Host "Iniciando entorno de desarrollo de RutaSegura..." -ForegroundColor Cyan

# 1. Verificar .env
if (!(Test-Path "apps/api/.env")) {
    Copy-Item "apps/api/.env.example" "apps/api/.env"
    Write-Host "Creado apps/api/.env" -ForegroundColor Yellow
}
if (!(Test-Path "apps/web/.env")) {
    Copy-Item "apps/web/.env.example" "apps/web/.env"
    Write-Host "Creado apps/web/.env" -ForegroundColor Yellow
}

# 2. Iniciar API en segundo plano
Write-Host "Iniciando API en el puerto 8001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoProfile -Command 'cd apps/api; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8001'"

# 3. Iniciar Web en segundo plano
Write-Host "Iniciando Web en el puerto 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoProfile -Command 'cd apps/web; npm run dev -- --port 3000'"

Write-Host "Despliegue completado. Revisa las terminales abiertas." -ForegroundColor Cyan
