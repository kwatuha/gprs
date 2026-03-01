#!/bin/bash

# IMPES Application Deployment Script to Remote Server
# This script deploys the application to a remote server using rsync

# Configuration - UPDATE THESE VALUES
SERVER_USER="kunye"
SERVER_IP="165.22.227.234"
SERVER_PATH="/projects/imes"
SSH_KEY="$HOME/.ssh/id_asusme"

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

# Check if SSH key exists
check_ssh_key() {
    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH key not found at: $SSH_KEY"
        exit 1
    fi
    print_success "SSH key found"
}

# Test SSH connection
test_ssh_connection() {
    print_status "Testing SSH connection to $SERVER_USER@$SERVER_IP..."
    if ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'" > /dev/null 2>&1; then
        print_success "SSH connection successful"
    else
        print_error "Failed to connect to server. Please check your SSH configuration."
        exit 1
    fi
}

# Create directory on server
create_server_directory() {
    print_status "Creating directory on server: $SERVER_PATH"
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"
    print_success "Directory created"
}

# Sync files to server
sync_files() {
    print_status "Syncing files to server..."
    print_warning "This may take a few minutes..."
    
    rsync -avz --progress \
        -e "ssh -i $SSH_KEY" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.env' \
        --exclude '*.log' \
        --exclude 'dist' \
        --exclude 'build' \
        --exclude '.DS_Store' \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        --exclude '.vscode' \
        --exclude '.idea' \
        --exclude 'db_data' \
        --exclude 'uploads/*' \
        ./ "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
    
    if [ $? -eq 0 ]; then
        print_success "Files synced successfully"
    else
        print_error "Failed to sync files"
        exit 1
    fi
}

# Deploy application on server
deploy_on_server() {
    print_status "Deploying application on server..."
    
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Navigate to application directory
        cd /projects/imes
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "Docker is not installed. Installing Docker..."
            sudo apt update
            sudo apt install -y docker.io docker-compose
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
        fi
        
        # Check if docker-compose is installed
        if ! command -v docker-compose &> /dev/null; then
            echo "docker-compose is not installed. Installing docker-compose..."
            sudo apt install -y docker-compose
        fi
        
        # Stop existing containers (if any)
        echo "Stopping existing containers..."
        docker-compose down 2>/dev/null || true
        
        # Build and start containers
        echo "Building and starting containers..."
        docker-compose build
        docker-compose up -d
        
        # Check status
        echo "Checking container status..."
        docker-compose ps
        
        echo "Deployment completed!"
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Application deployed successfully"
    else
        print_error "Failed to deploy application"
        exit 1
    fi
}

# Show deployment info
show_deployment_info() {
    echo
    print_success "========================================="
    print_success "   DEPLOYMENT COMPLETED SUCCESSFULLY!   "
    print_success "========================================="
    echo
    print_status "Server Information:"
    print_status "  - IP: $SERVER_IP"
    print_status "  - User: $SERVER_USER"
    print_status "  - Path: $SERVER_PATH"
    echo
    print_status "Access your application at:"
    print_status "  - Frontend: http://$SERVER_IP:8080/impes/"
    print_status "  - API: http://$SERVER_IP:3000/api/"
    print_status "  - Public Dashboard: http://$SERVER_IP:5174/"
    echo
    print_status "Useful commands:"
    print_status "  - View logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose logs'"
    print_status "  - Restart: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose restart'"
    print_status "  - Stop: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose down'"
    echo
}

# Main execution
main() {
    print_status "Starting IMPES Application Deployment to Remote Server..."
    print_status "Target: $SERVER_USER@$SERVER_IP:$SERVER_PATH"
    echo
    
    # Run checks
    check_ssh_key
    test_ssh_connection
    echo
    
    # Create directory
    create_server_directory
    echo
    
    # Sync files
    sync_files
    echo
    
    # Deploy
    deploy_on_server
    echo
    
    # Show info
    show_deployment_info
}

# Show help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "IMPES Application Remote Deployment Script"
    echo "Usage: $0 [--help|-h|--dry-run]"
    echo
    echo "This script deploys the IMPES application to a remote server"
    echo
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo "  --dry-run     Show what would be synced without actually syncing"
    echo
    echo "Configuration (edit script to change):"
    echo "  SERVER_USER: $SERVER_USER"
    echo "  SERVER_IP: $SERVER_IP"
    echo "  SERVER_PATH: $SERVER_PATH"
    echo "  SSH_KEY: $SSH_KEY"
    exit 0
fi

# Dry run option
if [ "$1" = "--dry-run" ]; then
    print_status "DRY RUN - Showing files that would be synced..."
    rsync -avz --dry-run \
        -e "ssh -i $SSH_KEY" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.env' \
        --exclude '*.log' \
        --exclude 'dist' \
        --exclude 'build' \
        --exclude '.DS_Store' \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        --exclude '.vscode' \
        --exclude '.idea' \
        --exclude 'db_data' \
        --exclude 'uploads/*' \
        ./ "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
    exit 0
fi

# Run main function
main


