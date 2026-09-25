#!/bin/bash
set -e

# Initialize multiple databases in PostgreSQL 18
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE ecosystem_core_db;
    CREATE DATABASE hrflow_db;
    CREATE DATABASE maintly_db;
    CREATE DATABASE keycloak_db;
    GRANT ALL PRIVILEGES ON DATABASE ecosystem_core_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE hrflow_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE maintly_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO postgres;
EOSQL
