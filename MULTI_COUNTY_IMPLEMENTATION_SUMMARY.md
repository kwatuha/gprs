# Multi-County Deployment System - Implementation Summary

## Overview

A comprehensive multi-tenant configuration system has been implemented to allow deploying the application to different counties from a single codebase. Each county can have its own database, Docker containers, ports, organization details, and seed data.

## What Was Implemented

### 1. Configuration System

**Location**: `config/counties/`

- **Default configuration** (`default.json`): Template configuration
- **County-specific configs** (`kisumu.json`, `kitui.json`): Individual county configurations
- Each config includes:
  - County information (code, name, display name)
  - Database configuration (name, seed file path)
  - Docker settings (ports, container names, volumes)
  - Organization details (name, contact info)
  - Customizable labels (department, section, etc.)
  - Feature flags

### 2. Backend Configuration Loader

**Files Created**:
- `api/config/countyConfig.js`: Loads and manages county configurations
- `api/config/db.js`: Updated to use county-specific database names
- `api/routes/countyConfigRoutes.js`: API endpoint to expose county config

**Features**:
- Automatic configuration loading based on `COUNTY_CODE` environment variable
- Fallback to default configuration if county config not found
- Singleton pattern for efficient config access
- Public API endpoint for frontend to access configuration

### 3. Frontend Configuration Integration

**Files Created**:
- `frontend/src/services/countyConfigService.js`: Service to fetch county config from API
- `frontend/src/context/CountyConfigContext.jsx`: React context for county configuration

**Files Updated**:
- `frontend/src/App.jsx`: Wrapped with `CountyConfigProvider`

**Features**:
- Automatic configuration loading on app startup
- React context for easy access throughout the app
- Helper functions for labels, organization info, and feature flags
- Caching to avoid repeated API calls

### 4. Docker Compose Generation

**Files Created**:
- `scripts/generate-docker-compose.js`: Generates docker-compose.yml from county config

**Features**:
- Dynamic docker-compose.yml generation
- County-specific container names
- Unique ports per county
- County-specific database names
- Seed file path configuration

### 5. Deployment Scripts

**Files Created**:
- `scripts/deploy-county.sh`: Deploy application for a specific county
- `scripts/create-county.sh`: Create new county configuration
- `scripts/list-counties.sh`: List all available counties
- `scripts/manage-seeds.sh`: Manage county seed files

**Features**:
- One-command deployment
- Automatic port assignment
- Seed file management
- Configuration validation

### 6. Seed File Management

**Location**: `api/seeds/`

- Directory structure for county-specific seed files
- Scripts to create, copy, and manage seed files
- Support for county-specific initial data

### 7. Documentation

**Files Created**:
- `MULTI_COUNTY_DEPLOYMENT_GUIDE.md`: Comprehensive deployment guide
- `QUICK_COUNTY_SWITCH.md`: Quick reference for common tasks
- `README_MULTI_COUNTY.md`: Overview and quick start guide
- `MULTI_COUNTY_IMPLEMENTATION_SUMMARY.md`: This file

## Key Features

### ✅ Single Codebase
- All counties share the same codebase
- Changes to parent app benefit all counties
- No need for separate repositories

### ✅ Easy County Switching
```bash
./scripts/deploy-county.sh kisumu
./scripts/deploy-county.sh kitui
```

### ✅ Unique Ports Per County
- Allows running multiple counties simultaneously
- Automatic port assignment
- No port conflicts

### ✅ Separate Databases
- Each county has its own database
- County-specific seed data
- Isolated data per county

### ✅ Customizable Configuration
- Organization details per county
- Custom labels
- Feature flags
- Contact information

### ✅ Seed File Management
- Easy creation of county-specific seed files
- Copy from existing counties
- Organized in dedicated directory

## Usage Examples

### Deploy for Kisumu
```bash
./scripts/deploy-county.sh kisumu
```

### Create New County
```bash
./scripts/create-county.sh nyando "Nyando County"
./scripts/manage-seeds.sh create nyando
# Edit config/counties/nyando.json
# Edit api/seeds/nyando_setup.sql
./scripts/deploy-county.sh nyando
```

### List All Counties
```bash
./scripts/list-counties.sh
```

### Run Multiple Counties
```bash
# Terminal 1
./scripts/deploy-county.sh kisumu

# Terminal 2
./scripts/deploy-county.sh kitui
```

## Configuration Structure

Each county configuration file follows this structure:

```json
{
  "county": {
    "code": "KSM",
    "name": "Kisumu",
    "displayName": "Kisumu County Government"
  },
  "database": {
    "name": "kisumu_db",
    "seedFile": "api/init.sql"
  },
  "docker": {
    "ports": { ... },
    "containers": { ... },
    "volumes": { ... }
  },
  "organization": { ... },
  "labels": { ... },
  "features": { ... }
}
```

## API Integration

### Backend
- Configuration loaded automatically on startup
- Available via `/api/county-config` endpoint
- Database connection uses county-specific database name

### Frontend
- Configuration loaded via React context
- Available throughout the app using `useCountyConfig()` hook
- Helper functions for labels and organization info

## File Structure

```
config/
  counties/
    default.json
    kisumu.json
    kitui.json
    {county}.json

api/
  config/
    countyConfig.js
    db.js (updated)
  routes/
    countyConfigRoutes.js
  seeds/
    {county}_setup.sql

frontend/
  src/
    services/
      countyConfigService.js
    context/
      CountyConfigContext.jsx
    App.jsx (updated)

scripts/
  deploy-county.sh
  create-county.sh
  list-counties.sh
  manage-seeds.sh
  generate-docker-compose.js
```

## Environment Variables

- `COUNTY_CODE`: Determines which county configuration to use
  - Can be set as environment variable
  - Can be passed as script argument
  - Defaults to "default" if not set

## Benefits

1. **Single Source of Truth**: One codebase for all counties
2. **Easy Deployment**: One command to deploy any county
3. **Isolation**: Each county has separate database and containers
4. **Flexibility**: Customize per county without code changes
5. **Scalability**: Easy to add new counties
6. **Maintainability**: Changes to parent app benefit all counties
7. **Testing**: Can test multiple counties simultaneously

## Next Steps

1. **Create seed files** for each county with county-specific data
2. **Customize configurations** with actual county details
3. **Test deployments** for each county
4. **Document county-specific customizations**
5. **Set up CI/CD** if needed for automated deployments

## Notes

- Seed files can be in root directory or `api/seeds/` directory
- Port assignments are automatic but can be manually adjusted
- Container names must be unique per county
- Database names must be unique per county
- Volumes are separate per county for data isolation

## Support

For detailed information, see:
- `MULTI_COUNTY_DEPLOYMENT_GUIDE.md` - Comprehensive guide
- `QUICK_COUNTY_SWITCH.md` - Quick reference
- `README_MULTI_COUNTY.md` - Overview




