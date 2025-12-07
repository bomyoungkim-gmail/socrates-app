# Socrates App - Docker Cleanup Script
# Este script limpa imagens órfãs, containers parados e volumes não utilizados

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Socrates App - Docker Cleanup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Parar containers em execução do projeto
Write-Host "[1/5] Parando containers do projeto..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Containers parados com sucesso" -ForegroundColor Green
} else {
    Write-Host "⚠ Nenhum container rodando" -ForegroundColor DarkYellow
}
Write-Host ""

# 2. Remover imagens órfãs (dangling images)
Write-Host "[2/5] Removendo imagens órfãs (<none>)..." -ForegroundColor Yellow
$pruneResult = docker image prune -f 2>&1
if ($pruneResult -match "Total reclaimed space: (\d+\.?\d*\s*\w+)") {
    $space = $matches[1]
    Write-Host "✓ Espaço recuperado: $space" -ForegroundColor Green
} else {
    Write-Host "✓ Nenhuma imagem órfã encontrada" -ForegroundColor Green
}
Write-Host ""

# 3. Remover containers parados
Write-Host "[3/5] Removendo containers parados..." -ForegroundColor Yellow
docker container prune -f >$null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Containers removidos" -ForegroundColor Green
} else {
    Write-Host "⚠ Nenhum container para remover" -ForegroundColor DarkYellow
}
Write-Host ""

# 4. Remover volumes não utilizados (OPCIONAL - comentado por segurança)
# Write-Host "[4/5] Removendo volumes não utilizados..." -ForegroundColor Yellow
# docker volume prune -f >$null 2>&1
# Write-Host "✓ Volumes removidos" -ForegroundColor Green
# Write-Host ""

# 5. Mostrar espaço em disco usado por Docker
Write-Host "[4/5] Status do Docker:" -ForegroundColor Yellow
docker system df
Write-Host ""

# 6. Listar imagens atuais
Write-Host "[5/5] Imagens Docker disponíveis:" -ForegroundColor Yellow
docker images
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Limpeza concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o projeto, execute:" -ForegroundColor White
Write-Host "  docker-compose up --build" -ForegroundColor Cyan
Write-Host ""
