# Multi-County Deployment Guide

This guide explains how to deploy and manage the application for multiple counties using the same codebase.

## Overview

The application supports multi-tenant deployment where each county can have:
- Different database names and seed data
- Different Docker containers and ports
- Different organization details (name, contact info)
- Different labels (department, section, etc.)
- Different feature sets

All configurations are stored in JSON files, making it easy to add new counties without code changes.

## Directory Structure

```
config/
  counties/
    default.json      # Default/template configuration
    kisumu.json      # Kisumu County configuration
    kitui.json       # Kitui County configuration
    {county-code}.json  # Add more counties here

api/
  seeds/
    {county-code}_setup.sql  # County-specific seed files

scripts/
  create-county.sh        # Create a new county configuration
  deploy-county.sh        # Deploy for a specific county
  generate-docker-compose.js  # Generate docker-compose.yml
```

## Quick Start

### 1. Deploy for an Existing County

```bash
# Deploy for Kisumu (default ports)
./scripts/deploy-county.sh kisumu

# Deploy for Kitui (different ports)
./scripts/deploy-county.sh kitui
```

### 2. Create a New County Configuration

```bash
# Create configuration for a new county
./scripts/create-county.sh nyando "Nyando County"

# This will:
# - Create config/counties/nyando.json
# - Assign unique ports
# - Generate a template with default values
```

### 3. Customize the County Configuration

Edit `config/counties/{county-code}.json`:

```json
{
  "county": {
    "code": "NYA",
    "name": "Nyando",
    "displayName": "Nyando County Government"
  },
  "database": {
    "name": "nyando_db",
    "seedFile": "api/seeds/nyando_setup.sql"
  },
  "docker": {
    "ports": {
      "nginx": 8082,
      "frontend": 5178,
      "publicDashboard": 5179,
      "api": 3002,
      "mysql": 3309
    },
    "containers": {
      "nginx": "nyando_nginx_proxy",
      "frontend": "nyando_react_frontend",
      "publicDashboard": "nyando_public_dashboard",
      "api": "nyando_node_api",
      "mysql": "nyando_db"
    },
    "volumes": {
      "mysql": "nyando_db_data"
    }
  },
  "organization": {
    "name": "Nyando County Government",
    "contact": {
      "email": "info@nyando.go.ke",
      "phone": "+254-057-XXXXXX",
      "address": "Nyando County Headquarters",
      "website": "https://www.nyando.go.ke"
    }
  },
  "labels": {
    "department": "Department",
    "section": "Section",
    "directorate": "Directorate",
    "project": "Project",
    "subcounty": "Sub-County",
    "ward": "Ward",
    "program": "Program",
    "subprogram": "Sub-Program"
  },
  "features": {
    "departments": true,
    "sections": true,
    "directorates": true,
    "projects": true,
    "subcounties": true,
    "wards": true,
    "programs": true,
    "subprograms": true
  }
}
```

### 4. Create County Seed File

Create `api/seeds/{county-code}_setup.sql` with county-specific data:

```sql
-- Nyando County Seed Data
-- This file is loaded when the MySQL container is first created

-- Insert departments, sections, subcounties, wards, etc.
-- You can copy from api/init.sql and modify for Nyando
```

### 5. Deploy the New County

```bash
./scripts/deploy-county.sh nyando
```

## Configuration Details

### County Configuration File Structure

Each county configuration file (`config/counties/{county-code}.json`) contains:

1. **county**: Basic county information
   - `code`: Short code (e.g., "KSM", "KIT")
   - `name`: County name
   - `displayName`: Full display name

2. **database**: Database configuration
   - `name`: Database name (must be unique per county)
   - `seedFile`: Path to SQL seed file

3. **docker**: Docker deployment configuration
   - `ports`: Port mappings for all services
   - `containers`: Container names (must be unique)
   - `volumes`: Volume names (must be unique)

4. **organization**: Organization details
   - `name`: Organization name
   - `contact`: Contact information (email, phone, address, website)

5. **labels**: UI labels customization
   - Customize how fields are displayed in the UI

6. **features**: Feature flags
   - Enable/disable specific features per county

## Port Management

Each county gets unique ports to allow running multiple deployments simultaneously:

- **Kisumu (default)**: nginx=8080, api=3000, mysql=3307
- **Kitui**: nginx=8081, api=3001, mysql=3308
- **Next county**: nginx=8082, api=3002, mysql=3309
- And so on...

The `create-county.sh` script automatically assigns the next available ports.

## Environment Variables

The system uses the `COUNTY_CODE` environment variable to determine which county to deploy:

```bash
# Set county code
export COUNTY_CODE=kisumu

# Or pass as argument
./scripts/deploy-county.sh kisumu
```

## API Access

The county configuration is available via API:

```bash
# Get current county configuration
curl http://localhost:3000/api/county-config
```

This returns public configuration (excludes sensitive data like database passwords).

## Frontend Integration

The frontend automatically loads county configuration on startup:

```javascript
import { useCountyConfig } from './context/CountyConfigContext';

function MyComponent() {
  const { config, getLabel, getOrganization } = useCountyConfig();
  
  return (
    <div>
      <h1>{getOrganization().name}</h1>
      <p>{getLabel('department')}</p>
    </div>
  );
}
```

## Database Management

### Creating a New Database

When you deploy a new county, Docker Compose will:
1. Create a new MySQL container with the county-specific database name
2. Load the seed file specified in the configuration
3. Use a separate volume for data persistence

### Accessing County Databases

```bash
# Connect to Kisumu database
docker exec -it kisumu_db mysql -u impesUser -pAdmin2010impes kisumu_db

# Connect to Kitui database
docker exec -it kitui_db mysql -u impesUser -pAdmin2010impes kitui_db
```

## Running Multiple Counties Simultaneously

You can run multiple county deployments on the same machine:

```bash
# Terminal 1: Deploy Kisumu
./scripts/deploy-county.sh kisumu

# Terminal 2: Deploy Kitui (different ports)
./scripts/deploy-county.sh kitui
```

Each will have:
- Separate containers
- Separate databases
- Separate ports
- Separate volumes

## Best Practices

1. **Use descriptive county codes**: Use 3-letter codes (e.g., "KSM", "KIT", "NYA")

2. **Keep seed files organized**: Store all seed files in `api/seeds/` with naming pattern `{county-code}_setup.sql`

3. **Test ports don't conflict**: Before deploying, check that ports aren't already in use

4. **Backup before switching**: If switching between counties, backup your data first

5. **Use version control**: Commit county configurations to git (but not sensitive data)

6. **Document customizations**: If a county has special requirements, document them in comments

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

1. Check which process is using the port:
   ```bash
   lsof -i :8080
   ```

2. Stop the conflicting container:
   ```bash
   docker-compose down
   ```

3. Or use a different county with different ports

### Database Connection Errors

If the API can't connect to the database:

1. Check the database container is running:
   ```bash
   docker ps | grep _db
   ```

2. Verify the database name matches the config:
   ```bash
   docker exec -it {county}_db mysql -u impesUser -pAdmin2010impes -e "SHOW DATABASES;"
   ```

3. Check environment variables in the API container:
   ```bash
   docker exec {county}_node_api env | grep DB_
   ```

### Configuration Not Loading

If county configuration isn't loading:

1. Verify the config file exists:
   ```bash
   ls -la config/counties/{county-code}.json
   ```

2. Check JSON syntax:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('config/counties/{county-code}.json'))"
   ```

3. Verify COUNTY_CODE is set:
   ```bash
   echo $COUNTY_CODE
   ```

## Migration from Single to Multi-County

If you have an existing deployment:

1. Create a county configuration matching your current setup
2. Update docker-compose.yml to use the new structure
3. Migrate your database to the new database name
4. Update any hardcoded references to use the county config

## Support

For issues or questions:
1. Check the configuration files in `config/counties/`
2. Review Docker logs: `docker-compose logs`
3. Check API logs: `docker-compose logs api`
4. Verify environment variables are set correctly




