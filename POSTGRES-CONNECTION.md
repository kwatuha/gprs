# Connecting to Local PostgreSQL Database

## Connection Details

- **Host**: `localhost` (or `127.0.0.1`)
- **Port**: `5433`
- **Database**: `government_projects`
- **Username**: `postgres`
- **Password**: `postgres`

## Connection Methods

### 1. Using psql Command Line

```bash
psql -h localhost -p 5433 -U postgres -d government_projects
```

When prompted, enter password: `postgres`

Or with password in command:
```bash
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d government_projects
```

### 2. Using Docker Exec (Direct Container Access)

```bash
docker exec -it gov_postgres psql -U postgres -d government_projects
```

This connects directly to the container without needing the port.

### 3. Connection String Format

**PostgreSQL connection string:**
```
postgresql://postgres:postgres@localhost:5433/government_projects
```

**For applications (Node.js, Python, etc.):**
- Host: `localhost`
- Port: `5433`
- Database: `government_projects`
- User: `postgres`
- Password: `postgres`

### 4. Using GUI Tools

#### pgAdmin
- Host: `localhost`
- Port: `5433`
- Database: `government_projects`
- Username: `postgres`
- Password: `postgres`

#### DBeaver
- Database Type: PostgreSQL
- Host: `localhost`
- Port: `5433`
- Database: `government_projects`
- Username: `postgres`
- Password: `postgres`

#### TablePlus
- Type: PostgreSQL
- Host: `localhost`
- Port: `5433`
- Database: `government_projects`
- User: `postgres`
- Password: `postgres`

### 5. Environment Variables

For your application, set these environment variables:

```bash
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=government_projects
```

Or in `.env` file:
```
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=government_projects
```

## Quick Commands

### List all tables
```bash
docker exec gov_postgres psql -U postgres -d government_projects -c "\dt"
```

### Count tables
```bash
docker exec gov_postgres psql -U postgres -d government_projects -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### View table structure
```bash
docker exec gov_postgres psql -U postgres -d government_projects -c "\d table_name"
```

### Run SQL query
```bash
docker exec gov_postgres psql -U postgres -d government_projects -c "SELECT * FROM users LIMIT 5;"
```

### Interactive psql session
```bash
docker exec -it gov_postgres psql -U postgres -d government_projects
```

Then you can run SQL commands interactively:
```sql
\dt                    -- List tables
\d users              -- Describe users table
SELECT * FROM users;   -- Query data
\q                     -- Quit
```

## Troubleshooting

### Connection Refused
If you get "connection refused", check if the container is running:
```bash
docker compose ps postgres_db
```

Start it if needed:
```bash
docker compose up -d postgres_db
```

### Authentication Failed
Make sure you're using:
- Username: `postgres`
- Password: `postgres`

### Database Does Not Exist
Create it:
```bash
docker exec gov_postgres psql -U postgres -c "CREATE DATABASE government_projects;"
```

## Notes

- The database is running in a Docker container
- Port `5433` is mapped from container port `5432` to avoid conflicts
- Data persists in Docker volume `gov_postgres_data`
- To backup: `docker exec gov_postgres pg_dump -U postgres government_projects > backup.sql`
- To restore: `docker exec -i gov_postgres psql -U postgres government_projects < backup.sql`
