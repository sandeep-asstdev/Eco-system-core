@echo off
echo ========================================================
echo Checking PostgreSQL 18 Database Server (Port 5433)...
echo Databases: ecosystem_core_db, hrflow_db, maintly_db
echo ========================================================

"C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL 18 is ALREADY RUNNING on localhost:5433!
    exit /b 0
)

echo Starting PostgreSQL 18 Windows Service...
sc start postgresql-x64-18 >nul 2>&1
timeout /t 2 >nul

"C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL 18 Windows Service started and running on port 5433!
    exit /b 0
)

if exist "C:\Program Files\PostgreSQL\18\data\postmaster.pid" (
    echo [RECOVERY] Removing stale postmaster.pid lockfile...
    del /f /q "C:\Program Files\PostgreSQL\18\data\postmaster.pid" >nul 2>&1
)

echo Starting PostgreSQL 18 server (standalone)...
"C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\18\data" -p 5433

