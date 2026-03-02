# Security Guidelines

## Environment Variables

All `.env` files are excluded from version control. Never commit:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- Any file containing passwords, API keys, or tokens

## Deployment Scripts

The `install-docker-remote.sh` script has been updated to use environment variables instead of hardcoded passwords:

```bash
# Use environment variable instead of hardcoded password
export SERVER_PASSWORD="your-password"
./install-docker-remote.sh
```

## Database Credentials

Database passwords and connection strings should never be committed. They are stored in:
- `.env` files (local development)
- Environment variables (production)
- Docker secrets (for production deployments)

## SSH Keys

All SSH keys are excluded from version control:
- `~/.ssh/id_*`
- `*.pem`
- `*.key`
- Any private key files

## Best Practices

1. **Never commit sensitive data** - Use `.gitignore` to exclude sensitive files
2. **Use environment variables** - Store secrets in environment variables, not in code
3. **Review before committing** - Always check `git status` before committing
4. **Use secrets management** - For production, use proper secrets management tools
5. **Rotate credentials** - Regularly rotate passwords and API keys

## Files Excluded from Git

The following types of files are automatically excluded:
- All `.env*` files
- Database dumps (`*.sql`, `*.dump`)
- SSH keys and certificates
- Log files
- Build artifacts
- Node modules
- Upload directories

See `.gitignore` for the complete list.
