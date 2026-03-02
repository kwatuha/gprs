# Database Connection Guide

This guide explains how to connect to the databases running in Docker containers on the remote server.

## Server Information

- **Server IP**: `102.210.149.119`
- **SSH User**: `fortress`
- **SSH Key**: `~/.ssh/id_gprs_server`
- **Application Path**: `/home/fortress/gprs`

## Database Information

### PostgreSQL (Primary Database)
- **Container Name**: `gov_postgres`
- **Database Name**: `government_projects`
- **Username**: `postgres`
- **Password**: `postgres`
- **Port (Host)**: `5433`
- **Port (Container)**: `5432`

### MySQL (Legacy/Migration Database)
- **Container Name**: `gov_db`
- **Database Name**: `gov_imbesdb`
- **Username**: `impesUser`
- **Password**: `Admin2010impes`
- **Root Password**: `root_password`
- **Port (Host)**: `3308`
- **Port (Container)**: `3306`

---

## Method 1: Terminal Connection (SSH + Docker Exec)

### PostgreSQL Connection via Terminal

#### Option A: Direct connection from your local machine (if port is exposed)

```bash
# Install PostgreSQL client if not already installed
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Connect to PostgreSQL on remote server
psql -h 102.210.149.119 -p 5433 -U postgres -d government_projects

# When prompted, enter password: postgres
```

#### Option B: SSH to server, then connect via Docker

```bash
# 1. SSH to the remote server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# 2. Navigate to application directory
cd /home/fortress/gprs

# 3. Connect to PostgreSQL container
docker exec -it gov_postgres psql -U postgres -d government_projects

# Or use docker-compose
docker-compose exec postgres_db psql -U postgres -d government_projects
```

#### Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- List all tables
\dt

-- Describe a table
\d table_name

-- List all users
\du

-- Show current database
SELECT current_database();

-- Count users
SELECT COUNT(*) FROM users;

-- View sample data
SELECT * FROM users LIMIT 5;

-- Exit psql
\q
```

### MySQL Connection via Terminal

#### Option A: Direct connection from your local machine

```bash
# Install MySQL client if not already installed
# Ubuntu/Debian:
sudo apt-get install mysql-client

# Connect to MySQL on remote server
mysql -h 102.210.149.119 -P 3308 -u impesUser -p gov_imbesdb

# When prompted, enter password: Admin2010impes
```

#### Option B: SSH to server, then connect via Docker

```bash
# 1. SSH to the remote server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# 2. Navigate to application directory
cd /home/fortress/gprs

# 3. Connect to MySQL container
docker exec -it gov_db mysql -u impesUser -p gov_imbesdb

# When prompted, enter password: Admin2010impes

# Or use docker-compose
docker-compose exec mysql_db mysql -u impesUser -p gov_imbesdb
```

#### Useful MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use a database
USE gov_imbesdb;

-- Show all tables
SHOW TABLES;

-- Describe a table
DESCRIBE table_name;

-- Count users
SELECT COUNT(*) FROM users;

-- View sample data
SELECT * FROM users LIMIT 5;

-- Exit MySQL
EXIT;
```

---

## Method 2: GUI Database Tools

### PostgreSQL GUI Tools

#### Option 1: pgAdmin (Web-based)

1. **Install pgAdmin** on your local machine:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install pgadmin4
   
   # Or download from: https://www.pgadmin.org/download/
   ```

2. **Add Server Connection**:
   - **Name**: GPRS Remote Server
   - **Host**: `102.210.149.119`
   - **Port**: `5433`
   - **Database**: `government_projects`
   - **Username**: `postgres`
   - **Password**: `postgres`

#### Option 2: DBeaver (Universal Database Tool)

1. **Download DBeaver**: https://dbeaver.io/download/

2. **Create New Connection**:
   - Select **PostgreSQL**
   - **Host**: `102.210.149.119`
   - **Port**: `5433`
   - **Database**: `government_projects`
   - **Username**: `postgres`
   - **Password**: `postgres`
   - Click **Test Connection** to verify
   - Click **Finish**

#### Option 3: TablePlus (macOS/Windows/Linux)

1. **Download TablePlus**: https://tableplus.com/

2. **Create New Connection**:
   - Select **PostgreSQL**
   - **Host**: `102.210.149.119`
   - **Port**: `5433`
   - **Database**: `government_projects`
   - **User**: `postgres`
   - **Password**: `postgres`
   - Click **Test** to verify
   - Click **Connect**

#### Option 4: DataGrip (JetBrains)

1. **Download DataGrip**: https://www.jetbrains.com/datagrip/

2. **Create New Data Source**:
   - Select **PostgreSQL**
   - **Host**: `102.210.149.119`
   - **Port**: `5433`
   - **Database**: `government_projects`
   - **User**: `postgres`
   - **Password**: `postgres`
   - Click **Test Connection**
   - Click **OK**

### MySQL GUI Tools

#### Option 1: MySQL Workbench

1. **Download MySQL Workbench**: https://dev.mysql.com/downloads/workbench/

2. **Create New Connection**:
   - **Connection Name**: GPRS MySQL Remote
   - **Hostname**: `102.210.149.119`
   - **Port**: `3308`
   - **Username**: `impesUser`
   - **Password**: `Admin2010impes`
   - **Default Schema**: `gov_imbesdb`
   - Click **Test Connection**
   - Click **OK**

#### Option 2: DBeaver (Universal Database Tool)

1. **Create New Connection**:
   - Select **MySQL**
   - **Host**: `102.210.149.119`
   - **Port**: `3308`
   - **Database**: `gov_imbesdb`
   - **Username**: `impesUser`
   - **Password**: `Admin2010impes`
   - Click **Test Connection**
   - Click **Finish**

#### Option 3: phpMyAdmin (Web-based)

If you want to install phpMyAdmin on the server:

```bash
# SSH to server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Add phpMyAdmin service to docker-compose.yml
# Then access via browser at http://102.210.149.119:8080/phpmyadmin
```

---

## Method 3: Port Forwarding (SSH Tunnel)

If the database ports are not exposed externally, you can create an SSH tunnel:

### PostgreSQL Tunnel

```bash
# Create SSH tunnel for PostgreSQL
ssh -i ~/.ssh/id_gprs_server -L 5433:localhost:5433 fortress@102.210.149.119

# Then connect using:
psql -h localhost -p 5433 -U postgres -d government_projects
```

### MySQL Tunnel

```bash
# Create SSH tunnel for MySQL
ssh -i ~/.ssh/id_gprs_server -L 3308:localhost:3308 fortress@102.210.149.119

# Then connect using:
mysql -h localhost -P 3308 -u impesUser -p gov_imbesdb
```

---

## Quick Reference Commands

### Check Database Status

```bash
# SSH to server
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119

# Check if containers are running
cd /home/fortress/gprs
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres_db

# Check MySQL logs
docker-compose logs mysql_db

# Check database size (PostgreSQL)
docker exec gov_postgres psql -U postgres -d government_projects -c "SELECT pg_size_pretty(pg_database_size('government_projects'));"

# Check database size (MySQL)
docker exec gov_db mysql -u impesUser -pAdmin2010impes gov_imbesdb -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'gov_imbesdb';"
```

### Backup Database

```bash
# PostgreSQL backup
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker exec gov_postgres pg_dump -U postgres government_projects" > backup_$(date +%Y%m%d).sql

# MySQL backup
ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker exec gov_db mysqldump -u impesUser -pAdmin2010impes gov_imbesdb" > mysql_backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# PostgreSQL restore
cat backup.sql | ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker exec -i gov_postgres psql -U postgres -d government_projects"

# MySQL restore
cat mysql_backup.sql | ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119 "cd /home/fortress/gprs && docker exec -i gov_db mysql -u impesUser -pAdmin2010impes gov_imbesdb"
```

---

## Troubleshooting

### Connection Refused

If you get "connection refused", check:

1. **Port is exposed**: Verify in `docker-compose.yml` that ports are mapped
2. **Container is running**: `docker-compose ps`
3. **Firewall**: Check if port is open on the server
   ```bash
   sudo ufw status
   sudo ufw allow 5433/tcp  # PostgreSQL
   sudo ufw allow 3308/tcp  # MySQL
   ```

### Authentication Failed

- Double-check username and password
- Verify credentials in `docker-compose.yml`
- Check if user exists in database

### Cannot Connect from GUI Tool

- Ensure the database port is exposed in `docker-compose.yml`
- Check server firewall rules
- Try using SSH tunnel method instead

---

## Security Notes

⚠️ **Important**: The current setup uses default passwords. For production:

1. Change default passwords
2. Use environment variables for sensitive data
3. Restrict database access to specific IPs
4. Use SSL/TLS for database connections
5. Consider using Docker secrets for passwords

---

## Summary

**Quickest way to connect:**

1. **Terminal (PostgreSQL)**: 
   ```bash
   ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119
   cd /home/fortress/gprs
   docker exec -it gov_postgres psql -U postgres -d government_projects
   ```

2. **GUI Tool (PostgreSQL)**: 
   - Use DBeaver or TablePlus
   - Host: `102.210.149.119`
   - Port: `5433`
   - Database: `government_projects`
   - User: `postgres`
   - Password: `postgres`
