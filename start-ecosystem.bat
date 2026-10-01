@echo off
title Automobile Ecosystem Starter
echo ===============================================================================
echo            AUTOMOBILE DEALERSHIP ECOSYSTEM - FULL STACK STARTER
echo ===============================================================================
echo.

set ROOT=%~dp0

:: 1. PostgreSQL 18 (Port 5433)
echo [1/6] Checking PostgreSQL 18 (Port 5433)...
netstat -ano | findstr ":5433" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\PostgreSQL\18\data\postmaster.pid" (
        echo [RECOVERY] Removing stale postmaster.pid lockfile...
        del /f /q "C:\Program Files\PostgreSQL\18\data\postmaster.pid" >nul 2>&1
    )
    echo [STARTING] PostgreSQL 18 on port 5433...
    start "PostgreSQL-18" cmd /k "title PostgreSQL 18 ^& ""C:\Program Files\PostgreSQL\18\bin\postgres.exe"" -D ""C:\Program Files\PostgreSQL\18\data"" -p 5433"
    timeout /t 3 >nul
) else (
    echo [OK] PostgreSQL 18 is already running on port 5433.
)

:: 2. RabbitMQ Message Broker (Port 5672 / 15672)
echo [2/6] Checking Message Broker (Port 5672)...
netstat -ano | findstr ":5672" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] RabbitMQ Message Broker...
    start "RabbitMQ-Broker" cmd /k "title RabbitMQ Message Broker ^& cd /d ""%ROOT%"" ^& node infra/rabbitmq/rabbitmq-server.js"
    timeout /t 1 >nul
) else (
    echo [OK] Message Broker is already running on port 5672.
)

:: 3. Keycloak Identity Server (Port 8080)
echo [3/6] Checking Keycloak Identity Server (Port 8080)...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] Keycloak Identity Provider (Port 8080)...
    start "Keycloak-OIDC" cmd /k "title Keycloak Identity Server ^& cd /d ""%ROOT%"" ^& node infra/keycloak/keycloak-server.js"
    timeout /t 1 >nul
) else (
    echo [OK] Keycloak Identity Server is already running on port 8080.
)

:: 4. Backends
echo [4/6] Checking Backends...
netstat -ano | findstr ":4000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] Ecosystem Core API (Port 4000)...
    start "Core-API-4000" cmd /k "title Core API (4000) ^& cd /d ""%ROOT%ecosystem-core\backend"" ^& npm run dev"
) else (
    echo [OK] Ecosystem Core API is running on port 4000.
)

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] HRFlow API (Port 5000)...
    start "HRFlow-API-5000" cmd /k "title HRFlow API (5000) ^& cd /d ""%ROOT%applications\HRFlow\backend"" ^& npm run dev"
) else (
    echo [OK] HRFlow API is running on port 5000.
)

netstat -ano | findstr ":5002" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] MAINTLY API (Port 5002)...
    start "Maintly-API-5002" cmd /k "title MAINTLY API (5002) ^& cd /d ""%ROOT%applications\Maintly\backend"" ^& npm run dev"
) else (
    echo [OK] MAINTLY API is running on port 5002.
)

:: 5. Frontends
echo [5/6] Checking Frontends...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] Ecosystem Portal (Port 3000)...
    start "Portal-Web-3000" cmd /k "title Ecosystem Portal (3000) ^& cd /d ""%ROOT%ecosystem-core\portal"" ^& npm run dev"
) else (
    echo [OK] Ecosystem Portal is running on port 3000.
)

netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] HRFlow Web (Port 3001)...
    start "HRFlow-Web-3001" cmd /k "title HRFlow Web (3001) ^& cd /d ""%ROOT%applications\HRFlow\frontend"" ^& npm run dev"
) else (
    echo [OK] HRFlow Web is running on port 3001.
)

netstat -ano | findstr ":3002" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [STARTING] MAINTLY Web (Port 3002)...
    start "Maintly-Web-3002" cmd /k "title MAINTLY Web (3002) ^& cd /d ""%ROOT%applications\Maintly\frontend"" ^& npm run dev"
) else (
    echo [OK] MAINTLY Web is running on port 3002.
)

echo.
echo ===============================================================================
echo [DONE] All Automobile Ecosystem services are active!
echo Central Portal: http://localhost:3000
echo HRFlow App:     http://localhost:3001
echo MAINTLY App:    http://localhost:3002
echo ===============================================================================
echo.
pause
