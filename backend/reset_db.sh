#!/bin/bash
# Reset Script
set -e

echo "Cleaning up migrations folders..."
rm -rf src/InterceptorSystem.Infrastructure/Migrations
rm -rf src/InterceptorSystem.Infrastructure/Persistence/Migrations

echo "Dropping all tables from database..."
PGPASSWORD=password123 psql -h localhost -U admin -d interceptor_db -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON SCHEMA public TO public;
"

echo "Creating new migration..."
dotnet ef migrations add Initial_Refactoring_Phase2 \
    --project src/InterceptorSystem.Infrastructure \
    --startup-project src/InterceptorSystem.Api \
    --output-dir Persistence/Migrations

echo "Applying migration to database..."
dotnet ef database update \
    --project src/InterceptorSystem.Infrastructure \
    --startup-project src/InterceptorSystem.Api

echo "Database reset and migration complete!"
