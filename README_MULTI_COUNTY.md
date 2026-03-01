# Multi-County Deployment System

This application supports deploying to multiple counties from a single codebase. Each county can have its own:
- Database with county-specific seed data
- Docker containers with unique names and ports
- Organization details and contact information
- Custom labels and feature configurations

## 🚀 Quick Start

### Deploy for an Existing County
```bash
./scripts/deploy-county.sh kisumu
```

### Create a New County
```bash
./scripts/create-county.sh nyando "Nyando County"
./scripts/manage-seeds.sh create nyando
./scripts/deploy-county.sh nyando
```

### List All Counties
```bash
./scripts/list-counties.sh
```

## 📁 Structure

```
config/
  counties/
    default.json      # Default configuration template
    kisumu.json       # Kisumu County config
    kitui.json        # Kitui County config
    {county}.json     # Add more counties here

api/
  seeds/
    {county}_setup.sql  # County-specific seed files

scripts/
  create-county.sh        # Create new county config
  deploy-county.sh        # Deploy for a county
  list-counties.sh        # List all counties
  manage-seeds.sh         # Manage seed files
  generate-docker-compose.js  # Generate docker-compose.yml
```

## 🔧 How It Works

1. **Configuration Files**: Each county has a JSON config file in `config/counties/`
2. **Database**: Each county gets its own database (e.g., `kisumu_db`, `kitui_db`)
3. **Docker**: Each county gets unique container names and ports
4. **Seed Data**: Each county can have its own SQL seed file
5. **Environment**: The `COUNTY_CODE` environment variable determines which county to deploy

## 📖 Documentation

- **[MULTI_COUNTY_DEPLOYMENT_GUIDE.md](./MULTI_COUNTY_DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide
- **[QUICK_COUNTY_SWITCH.md](./QUICK_COUNTY_SWITCH.md)** - Quick reference for common tasks

## 🎯 Key Features

- ✅ Single codebase for all counties
- ✅ Easy county switching via scripts
- ✅ Unique ports per county (run multiple simultaneously)
- ✅ Separate databases per county
- ✅ County-specific seed data
- ✅ Customizable labels and organization details
- ✅ Feature flags per county

## 🔄 Development Workflow

1. **Develop in parent app**: Make changes to the main codebase
2. **Test with a county**: Deploy to a test county to verify changes
3. **Deploy to production counties**: Deploy to production counties when ready
4. **Pull changes**: All counties benefit from parent app improvements

## 📝 Configuration Example

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
    "ports": {
      "nginx": 8080,
      "api": 3000,
      "mysql": 3307
    },
    "containers": {
      "nginx": "kisumu_nginx_proxy",
      "api": "kisumu_node_api",
      "mysql": "kisumu_db"
    }
  },
  "organization": {
    "name": "Kisumu County Government",
    "contact": {
      "email": "info@kisumu.go.ke",
      "phone": "+254-057-2020000"
    }
  }
}
```

## 🛠️ Scripts Reference

| Script | Purpose |
|--------|---------|
| `deploy-county.sh <code>` | Deploy application for a county |
| `create-county.sh <code> <name>` | Create new county configuration |
| `list-counties.sh` | List all available counties |
| `manage-seeds.sh list` | List seed files |
| `manage-seeds.sh create <code>` | Create seed file for county |
| `manage-seeds.sh copy <src> <dst>` | Copy seed from one county to another |

## 🌐 API Access

The county configuration is available via API:

```bash
GET /api/county-config
```

Returns public configuration (county info, organization, labels, features).

## 💡 Tips

1. **Use descriptive county codes**: 3-letter codes work best (KSM, KIT, NYA)
2. **Test ports don't conflict**: Check ports before deploying
3. **Backup before switching**: Always backup data before switching counties
4. **Version control configs**: Commit county configs to git (not sensitive data)
5. **Document customizations**: Add comments for county-specific requirements

## 🐛 Troubleshooting

See [MULTI_COUNTY_DEPLOYMENT_GUIDE.md](./MULTI_COUNTY_DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

Common issues:
- Port conflicts → Check with `lsof -i :PORT`
- Database connection errors → Verify container is running
- Config not loading → Check `COUNTY_CODE` env var and config file exists

## 📞 Support

For issues:
1. Check configuration files in `config/counties/`
2. Review Docker logs: `docker-compose logs`
3. Verify environment variables
4. Check the deployment guide for detailed troubleshooting




