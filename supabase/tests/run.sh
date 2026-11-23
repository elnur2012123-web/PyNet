#!/usr/bin/env bash
# Runs the migrations + security tests against a throwaway local Postgres database.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=pynest_test
psql -v ON_ERROR_STOP=1 -q -c "drop database if exists $DB" -c "create database $DB"
psql -v ON_ERROR_STOP=1 -q -d $DB -f supabase/tests/supabase_stub.sql
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -q -d $DB -f "$f"; done
psql -v ON_ERROR_STOP=1 -q -d $DB -f supabase/tests/rls_test.sql | grep PASSED
