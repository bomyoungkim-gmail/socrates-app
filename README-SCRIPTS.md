# 🚀 Scripts PowerShell - Socrates App

Este projeto inclui scripts PowerShell para facilitar o gerenciamento do Docker.

## 📝 Scripts Disponíveis

### 1. `cleanup.ps1` - Limpeza do Docker
Remove imagens órfãs, containers parados e libera espaço em disco.

```powershell
.\cleanup.ps1
```

**O que faz:**
- ✅ Para containers do projeto
- ✅ Remove imagens órfãs (`<none>`)
- ✅ Remove containers parados
- ✅ Mostra uso de disco do Docker
- ✅ Lista imagens disponíveis

---

### 2. `start.ps1` - Iniciar Projeto (com limpeza automática)
Limpa o Docker e inicia todos os serviços.

```powershell
.\start.ps1
```

**O que faz:**
- ✅ Executa limpeza automática
- ✅ Inicia todos os containers com `docker-compose up --build`
- ✅ Remove containers órfãos automaticamente

---

### 3. `stop.ps1` - Parar Projeto
Para todos os containers do projeto.

```powershell
.\stop.ps1
```

**O que faz:**
- ✅ Para todos os containers
- ✅ Remove containers órfãos

---

## 💡 Uso Recomendado

### Desenvolvimento diário:
```powershell
# Iniciar (com limpeza automática)
.\start.ps1

# Parar quando terminar
.\stop.ps1
```

### Limpeza manual:
```powershell
# Se quiser apenas limpar sem iniciar
.\cleanup.ps1
```

---

## 🔧 Comandos Docker Úteis

```powershell
# Ver containers rodando
docker ps

# Ver todas as imagens
docker images

# Ver uso de disco
docker system df

# Logs de um serviço específico
docker-compose logs backend-api
docker-compose logs frontend

# Rebuild de um serviço específico
docker-compose up --build backend-api
```

---

## ⚠️ Nota Importante

Os volumes do banco de dados (`pgdata`) e RabbitMQ (`rabbitmq_data`) **NÃO são removidos** pelos scripts de limpeza para preservar seus dados. 

Se precisar limpar volumes (⚠️ isso apagará todos os dados):
```powershell
docker volume prune -f
```
