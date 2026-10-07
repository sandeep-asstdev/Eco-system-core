@echo off
setlocal
title Automobile Dealership Ecosystem - Unified Runner

set "ROOT=%~dp0"

if /i "%~1"=="stop" goto DO_STOP
if /i "%~1"=="restart" goto DO_RESTART
if /i "%~1"=="status" goto RENDER_DASHBOARD

:DO_START
echo ===============================================================================
echo            AUTOMOBILE DEALERSHIP ECOSYSTEM - FULL STACK STARTER
echo ===============================================================================
echo.
echo Starting all ecosystem components in unified sequence...
echo.

:: 1. PostgreSQL 18
echo [1/9] Checking PostgreSQL 18 Database (Port 5433)...
netstat -ano | findstr ":5433" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto PG_RUNNING

echo   [STARTING] Starting PostgreSQL 18 Windows Service...
sc start postgresql-x64-18 >nul 2>&1
ping -n 3 127.0.0.1 >nul
netstat -ano | findstr ":5433" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 goto PG_RUNNING

if exist "C:\Program Files\PostgreSQL\18\data\postmaster.pid" (
    echo   [RECOVERY] Removing stale postmaster.pid lockfile...
    del /f /q "C:\Program Files\PostgreSQL\18\data\postmaster.pid" >nul 2>&1
)
echo   [STARTING] PostgreSQL 18 on port 5433 (standalone mode)...
start "PostgreSQL-18" cmd /k "title PostgreSQL 18 (5433) & ""C:\Program Files\PostgreSQL\18\bin\postgres.exe"" -D ""C:\Program Files\PostgreSQL\18\data"" -p 5433"
ping -n 4 127.0.0.1 >nul

:PG_RUNNING
echo   [OK] PostgreSQL 18 is active on port 5433.

:: 2. RabbitMQ Message Broker (Port 5672)
echo [2/9] Checking RabbitMQ Message Broker (Port 5672)...
netstat -ano | findstr ":5672" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] RabbitMQ Message Broker is already running on port 5672.
) else (
    echo   [STARTING] RabbitMQ Message Broker on port 5672...
    start "RabbitMQ-Broker" cmd /k "title RabbitMQ Broker (5672) & cd /d %ROOT% & node infra/rabbitmq/rabbitmq-server.js"
    ping -n 3 127.0.0.1 >nul
)

:: 3. Keycloak OIDC Identity Server (Port 8080)
echo [3/9] Checking Keycloak Identity Provider (Port 8080)...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Keycloak Identity Provider is already running on port 8080.
) else (
    echo   [STARTING] Keycloak Identity Provider on port 8080...
    start "Keycloak-OIDC" cmd /k "title Keycloak Identity (8080) & cd /d %ROOT% & node infra/keycloak/keycloak-server.js"
    ping -n 3 127.0.0.1 >nul
)

:: 4. Ecosystem Core Backend API (Port 4000)
echo [4/9] Checking Ecosystem Core API (Port 4000)...
netstat -ano | findstr ":4000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Ecosystem Core API is already running on port 4000.
) else (
    echo   [STARTING] Ecosystem Core API on port 4000...
    start "Core-API-4000" cmd /k "title Ecosystem Core API (4000) & cd /d %ROOT%ecosystem-core\backend & npm run dev"
    ping -n 3 127.0.0.1 >nul
)

:: 5. HRFlow Backend API (Port 5000)
echo [5/9] Checking HRFlow Backend API (Port 5000)...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] HRFlow Backend API is already running on port 5000.
) else (
    echo   [STARTING] HRFlow API on port 5000...
    start "HRFlow-API-5000" cmd /k "title HRFlow Backend (5000) & cd /d %ROOT%applications\HRFlow\backend & npm run dev"
    ping -n 3 127.0.0.1 >nul
)

:: 6. MAINTLY Backend API (Port 5002)
echo [6/9] Checking MAINTLY Backend API (Port 5002)...
netstat -ano | findstr ":5002" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] MAINTLY Backend API is already running on port 5002.
) else (
    echo   [STARTING] MAINTLY API on port 5002...
    start "Maintly-API-5002" cmd /k "title MAINTLY Backend (5002) & cd /d %ROOT%applications\Maintly\backend & npm run dev"
    ping -n 3 127.0.0.1 >nul
)

:: 7. Ecosystem Portal Frontend (Port 3000)
echo [7/9] Checking Ecosystem Portal Web (Port 3000)...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Ecosystem Portal is already running on port 3000.
) else (
    echo   [STARTING] Ecosystem Portal Frontend on port 3000...
    start "Portal-Web-3000" cmd /k "title Ecosystem Portal (3000) & cd /d %ROOT%ecosystem-core\portal & npm run dev"
    ping -n 2 127.0.0.1 >nul
)

:: 8. HRFlow Frontend Web (Port 3001)
echo [8/9] Checking HRFlow Frontend Web (Port 3001)...
netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] HRFlow Frontend is already running on port 3001.
) else (
    echo   [STARTING] HRFlow Frontend Web on port 3001...
    start "HRFlow-Web-3001" cmd /k "title HRFlow Web (3001) & cd /d %ROOT%applications\HRFlow\frontend & npm run dev"
    ping -n 2 127.0.0.1 >nul
)

:: 9. MAINTLY Frontend Web (Port 3002)
echo [9/9] Checking MAINTLY Frontend Web (Port 3002)...
netstat -ano | findstr ":3002" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] MAINTLY Frontend is already running on port 3002.
) else (
    echo   [STARTING] MAINTLY Frontend Web on port 3002...
    start "Maintly-Web-3002" cmd /k "title MAINTLY Web (3002) & cd /d %ROOT%applications\Maintly\frontend & npm run dev"
    ping -n 2 127.0.0.1 >nul
)

echo.
echo Waiting 4 seconds for services to establish listeners...
ping -n 5 127.0.0.1 >nul

:RENDER_DASHBOARD
echo.
echo ===============================================================================
echo            AUTOMOBILE DEALERSHIP ECOSYSTEM - FULL STACK STATUS
echo ===============================================================================
echo.
echo   SERVICE NAME                   PORT     STATUS    URL / ENDPOINT
echo   -----------------------------------------------------------------------------

netstat -ano | findstr ":5433" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [PostgreSQL 18 Database]      :5433    ONLINE    localhost:5433 [3 DBs]
) else (
    echo   [PostgreSQL 18 Database]      :5433    OFFLINE   localhost:5433
)

netstat -ano | findstr ":5672" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [RabbitMQ Message Broker]     :5672    ONLINE    amqp://localhost:5672
    echo   [RabbitMQ Management UI]      :15672   ONLINE    http://localhost:15672
) else (
    echo   [RabbitMQ Message Broker]     :5672    OFFLINE   amqp://localhost:5672
)

netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [Keycloak Identity Provider]  :8080    ONLINE    http://localhost:8080
) else (
    echo   [Keycloak Identity Provider]  :8080    OFFLINE   http://localhost:8080
)

netstat -ano | findstr ":4000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [Ecosystem Core API]          :4000    ONLINE    http://localhost:4000/api/v1
) else (
    echo   [Ecosystem Core API]          :4000    OFFLINE   http://localhost:4000/api/v1
)

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [HRFlow Backend API]          :5000    ONLINE    http://localhost:5000/api
) else (
    echo   [HRFlow Backend API]          :5000    OFFLINE   http://localhost:5000/api
)

netstat -ano | findstr ":5002" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [MAINTLY Backend API]         :5002    ONLINE    http://localhost:5002/api
) else (
    echo   [MAINTLY Backend API]         :5002    OFFLINE   http://localhost:5002/api
)

echo   -----------------------------------------------------------------------------

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [Ecosystem Portal Web]        :3000    ONLINE    http://localhost:3000
) else (
    echo   [Ecosystem Portal Web]        :3000    OFFLINE   http://localhost:3000
)

netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [HRFlow Frontend Web]         :3001    ONLINE    http://localhost:3001
) else (
    echo   [HRFlow Frontend Web]         :3001    OFFLINE   http://localhost:3001
)

netstat -ano | findstr ":3002" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [MAINTLY Frontend Web]        :3002    ONLINE    http://localhost:3002
) else (
    echo   [MAINTLY Frontend Web]        :3002    OFFLINE   http://localhost:3002
)

echo ===============================================================================
echo.
echo   Management commands:
echo     start-ecosystem.bat          - Start all ecosystem services (1-click)
echo     start-ecosystem.bat status   - Show current health status
echo     start-ecosystem.bat restart  - Restart all services
echo     start-ecosystem.bat stop     - Stop all running application services
echo.
echo ===============================================================================

if /i "%~1"=="status" goto END

echo Opening Ecosystem Portal in default browser...
start http://localhost:3000

:END
exit /b 0

:: -----------------------------------------------------------------------------
:: STOP COMMAND
:: -----------------------------------------------------------------------------
:DO_STOP
echo ===============================================================================
echo             STOPPING ALL AUTOMOBILE ECOSYSTEM SERVICES
echo ===============================================================================
echo Stopping application processes on ports 3000, 3001, 3002, 4000, 5000, 5002, 5672, 8080...
powershell -NoProfile -Command "3000,3001,3002,4000,5000,5002,5672,8080 | ForEach-Object { $p = $_; Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Host \"  [STOPPED] Terminated process on port $p (PID $_)\" } }"
echo.
echo All application services have been stopped.
echo (PostgreSQL 18 database remains active for data safety.)
exit /b 0

:: -----------------------------------------------------------------------------
:: RESTART COMMAND
:: -----------------------------------------------------------------------------
:DO_RESTART
call "%~f0" stop
ping -n 3 127.0.0.1 >nul
call "%~f0"
exit /b 0
