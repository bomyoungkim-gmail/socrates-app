# Socrates App - Start Script
# Limpa imagens órfãs e inicia o projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Socrates App - Iniciando..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Executar limpeza
Write-Host "Executando limpeza automática..." -ForegroundColor Yellow
& "$PSScriptRoot\cleanup.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando containers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar com docker-compose
docker-compose up --build --remove-orphans
