# Socrates App - Stop Script
# Para todos os containers do projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Socrates App - Parando..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker-compose down --remove-orphans

Write-Host ""
Write-Host "✓ Containers parados com sucesso!" -ForegroundColor Green
Write-Host ""
