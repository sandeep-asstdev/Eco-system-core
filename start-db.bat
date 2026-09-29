@echo off
echo ========================================================
echo Starting PostgreSQL 18 Database Server (Port 5433)...
echo Databases: ecosystem_core_db, hrflow_db, maintly_db
echo ========================================================

"C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h localhost -p 5433 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PostgreSQL 18 is ALREADY RUNNING on localhost:5433!
    pause
    exit /b 0
)

echo Starting PostgreSQL 18 server...
"C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\18\data" -p 5433
