#!/bin/bash

# IMPES Application Deployment Script
# This script builds Docker images and pushes them to GitHub Container Registry

# Configuration - UPDATE THESE VALUES
GITHUB_USERNAME="your-github-username"
VERSION="v1.0.0"
GITHUB_TOKEN=""  # Set this environment variable or update here

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install it and try again."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Login to GitHub Container Registry
login_github_registry() {
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "GITHUB_TOKEN not set. Please login manually:"
        print_status "Run: docker login ghcr.io"
        print_status "Username: $GITHUB_USERNAME"
        print_status "Password: your-personal-access-token"
        
        if ! docker login ghcr.io; then
            print_error "Failed to login to GitHub Container Registry"
            exit 1
        fi
    else
        print_status "Logging in to GitHub Container Registry..."
        if echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin; then
            print_success "Successfully logged in to GitHub Container Registry"
        else
            print_error "Failed to login to GitHub Container Registry"
            exit 1
        fi
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    if docker-compose build; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Tag images for GitHub Container Registry
tag_images() {
    print_status "Tagging images for GitHub Container Registry..."
    
    # Tag frontend
    if docker tag impes-frontend "ghcr.io/$GITHUB_USERNAME/impes-frontend:latest"; then
        print_success "Tagged impes-frontend:latest"
    else
        print_error "Failed to tag impes-frontend:latest"
        exit 1
    fi
    
    if docker tag impes-frontend "ghcr.io/$GITHUB_USERNAME/impes-frontend:$VERSION"; then
        print_success "Tagged impes-frontend:$VERSION"
    else
        print_error "Failed to tag impes-frontend:$VERSION"
        exit 1
    fi
    
    # Tag API
    if docker tag impes-api "ghcr.io/$GITHUB_USERNAME/impes-api:latest"; then
        print_success "Tagged impes-api:latest"
    else
        print_error "Failed to tag impes-api:latest"
        exit 1
    fi
    
    if docker tag impes-api "ghcr.io/$GITHUB_USERNAME/impes-api:$VERSION"; then
        print_success "Tagged impes-api:$VERSION"
    else
        print_error "Failed to tag impes-api:$VERSION"
        exit 1
    fi
    
    # Tag Nginx
    if docker tag nginx:alpine "ghcr.io/$GITHUB_USERNAME/impes-nginx:latest"; then
        print_success "Tagged impes-nginx:latest"
    else
        print_error "Failed to tag impes-nginx:latest"
        exit 1
    fi
    
    if docker tag nginx:alpine "ghcr.io/$GITHUB_USERNAME/impes-nginx:$VERSION"; then
        print_success "Tagged impes-nginx:$VERSION"
    else
        print_error "Failed to tag impes-nginx:$VERSION"
        exit 1
    fi
}

# Push images to GitHub Container Registry
push_images() {
    print_status "Pushing images to GitHub Container Registry..."
    
    # Push frontend
    print_status "Pushing impes-frontend:latest..."
    if docker push "ghcr.io/$GITHUB_USERNAME/impes-frontend:latest"; then
        print_success "Pushed impes-frontend:latest"
    else
        print_error "Failed to push impes-frontend:latest"
        exit 1
    fi
    
    print_status "Pushing impes-frontend:$VERSION..."
    if docker push "ghcr.io/$GITHUB_USERNAME/impes-frontend:$VERSION"; then
        print_success "Pushed impes-frontend:$VERSION"
    else
        print_error "Failed to push impes-frontend:$VERSION"
        exit 1
    fi
    
    # Push API
    print_status "Pushing impes-api:latest..."
    if docker push "ghcr.io/$GITHUB_USERNAME/impes-api:latest"; then
        print_success "Pushed impes-api:latest"
    else
        print_error "Failed to push impes-api:latest"
        exit 1
    fi
    
    print_status "Pushing impes-api:$VERSION..."
    if docker push "ghcr.io/$GITHUB_USERNAME/impes-api:$VERSION"; then
        print_success "Pushed impes-api:$VERSION"
    else
        print_error "Failed to push impes-api:$VERSION"
        exit 1
    fi
    
    # Push Nginx
    print_status "Pushing impes-nginx:latest..."
    if docker push "ghcr.io/$GITHUB_USERNAME/impes-nginx:latest"; then
        print_success "Pushed impes-nginx:latest"
    else
        print_error "Failed to push impes-nginx:latest"
        exit 1
    fi
    
    print_status "Pushing impes-nginx:$VERSION..."
    if docker push "ghcr.io/$GITHUB_USERNAME/impes-nginx:$VERSION"; then
        print_success "Pushed impes-nginx:$VERSION"
    else
        print_error "Failed to push impes-nginx:$VERSION"
        exit 1
    fi
}

# Create production docker-compose.yml
create_production_compose() {
    print_status "Creating production docker-compose.yml..."
    
    cat > docker-compose.production.yml << EOF
# Production docker-compose.yml for IMPES Application
# Generated by deploy.sh script

services:
  nginx_proxy:
    image: ghcr.io/$GITHUB_USERNAME/impes-nginx:latest
    container_name: nginx_proxy
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - api
    restart: unless-stopped

  frontend:
    image: ghcr.io/$GITHUB_USERNAME/impes-frontend:latest
    container_name: react_frontend
    ports:
      - "5173:80"
    depends_on:
      - api
    restart: unless-stopped

  api:
    image: ghcr.io/$GITHUB_USERNAME/impes-api:latest
    container_name: node_api
    ports:
      - "3000:3000"
    depends_on:
      - mysql_db
    environment:
      DB_HOST: db
      DB_USER: impesUser
      DB_PASSWORD: Admin2010impes
      DB_NAME: imbesdb
    restart: unless-stopped

  mysql_db:
    image: mysql:8.0
    container_name: db
    restart: always
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: imbesdb
      MYSQL_USER: impesUser
      MYSQL_PASSWORD: Admin2010impes
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  db_data:
EOF

    print_success "Created docker-compose.production.yml"
}

# Main execution
main() {
    print_status "Starting IMPES Application Deployment..."
    print_status "Version: $VERSION"
    print_status "GitHub Username: $GITHUB_USERNAME"
    echo
    
    # Run checks
    check_docker
    check_docker_compose
    echo
    
    # Build and deploy
    build_images
    echo
    
    # Login to registry
    login_github_registry
    echo
    
    # Tag images
    tag_images
    echo
    
    # Push images
    push_images
    echo
    
    # Create production compose file
    create_production_compose
    echo
    
    print_success "Deployment completed successfully!"
    echo
    print_status "Next steps:"
    print_status "1. Update GITHUB_USERNAME in this script if needed"
    print_status "2. Use docker-compose.production.yml for production deployments"
    print_status "3. Images are now available at:"
    print_status "   - ghcr.io/$GITHUB_USERNAME/impes-frontend:latest"
    print_status "   - ghcr.io/$GITHUB_USERNAME/impes-api:latest"
    print_status "   - ghcr.io/$GITHUB_USERNAME/impes-nginx:latest"
    echo
    print_status "For production deployment on new machines:"
    print_status "1. Copy docker-compose.production.yml to target machine"
    print_status "2. Run: docker-compose -f docker-compose.production.yml up -d"
}

# Check if script is run with correct parameters
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "IMPES Application Deployment Script"
    echo "Usage: $0 [--help|-h]"
    echo
    echo "This script builds Docker images and pushes them to GitHub Container Registry"
    echo
    echo "Before running:"
    echo "1. Update GITHUB_USERNAME variable in this script"
    echo "2. Set GITHUB_TOKEN environment variable or login manually"
    echo "3. Ensure Docker and docker-compose are running"
    echo
    echo "Example:"
    echo "  export GITHUB_TOKEN=your_token_here"
    echo "  ./deploy.sh"
    exit 0
fi

# Run main function
main
