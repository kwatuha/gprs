# Quick County Switch Guide

## Quick Commands

### List Available Counties
```bash
./scripts/list-counties.sh
```

### Deploy a County
```bash
./scripts/deploy-county.sh <county-code>
```

Examples:
```bash
./scripts/deploy-county.sh kisumu
./scripts/deploy-county.sh kitui
```

### Create a New County
```bash
./scripts/create-county.sh <county-code> "County Name"
```

Example:
```bash
./scripts/create-county.sh nyando "Nyando County"
```

### Manage Seed Files
```bash
# List seed files
./scripts/manage-seeds.sh list

# Create a new seed file
./scripts/manage-seeds.sh create <county-code>

# Copy seed from one county to another
./scripts/manage-seeds.sh copy <source> <target>
```

## Workflow

### 1. Create a New County Configuration
```bash
./scripts/create-county.sh nyando "Nyando County"
```

This creates:
- `config/counties/nyando.json` - County configuration
- Assigns unique ports automatically

### 2. Create Seed File
```bash
./scripts/manage-seeds.sh create nyando
```

Or copy from an existing county:
```bash
./scripts/manage-seeds.sh copy kitui nyando
```

### 3. Customize Configuration
Edit `config/counties/nyando.json`:
- Update organization contact details
- Customize labels if needed
- Enable/disable features

### 4. Customize Seed Data
Edit `api/seeds/nyando_setup.sql`:
- Add county-specific departments
- Add subcounties and wards
- Add initial data

### 5. Deploy
```bash
./scripts/deploy-county.sh nyando
```

## Running Multiple Counties

You can run multiple counties simultaneously on the same machine:

```bash
# Terminal 1
./scripts/deploy-county.sh kisumu
# Access at: http://localhost:8080

# Terminal 2
./scripts/deploy-county.sh kitui
# Access at: http://localhost:8081
```

Each county will have:
- Separate containers (different names)
- Separate databases
- Separate ports
- Separate volumes

## Switching Between Counties

To switch from one county to another:

```bash
# Stop current deployment
docker-compose down

# Deploy new county
./scripts/deploy-county.sh <new-county-code>
```

## Access Points

After deployment, access your application at:

- **Frontend**: `http://localhost:<frontend-port>`
- **Public Dashboard**: `http://localhost:<public-dashboard-port>`
- **API**: `http://localhost:<api-port>`
- **Nginx**: `http://localhost:<nginx-port>`

Ports are shown when you run `./scripts/list-counties.sh`

## Troubleshooting

### Port Conflicts
If you get port conflicts, check which ports are in use:
```bash
lsof -i :8080
```

### Database Issues
Check if database container is running:
```bash
docker ps | grep _db
```

### Configuration Not Loading
Verify COUNTY_CODE is set:
```bash
echo $COUNTY_CODE
```

Check config file exists:
```bash
ls -la config/counties/<county-code>.json
```

## Environment Variables

The system uses `COUNTY_CODE` environment variable. You can set it manually:

```bash
export COUNTY_CODE=kisumu
./scripts/deploy-county.sh
```

Or pass it as an argument:
```bash
./scripts/deploy-county.sh kisumu
```




