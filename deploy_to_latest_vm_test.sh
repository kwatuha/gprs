#!/bin/bash

# IMPES Application Deployment Script to Latest VM Test Server
# Server: 66.179.80.249
# User: root

# Configuration
SERVER_USER="root"
SERVER_IP="66.179.80.249"
SERVER_PATH="/root/government_projects"
# Try to use a dedicated key for this server, fall back to existing keys
SSH_KEY="$HOME/.ssh/id_latest_vm_test"

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
        print_warning "SSH key not found at: $SSH_KEY"
        print_status "Trying default SSH key locations..."
        
        # Try common SSH key locations in order of preference
        if [ -f "$HOME/.ssh/id_rsa" ]; then
            SSH_KEY="$HOME/.ssh/id_rsa"
            print_success "Using SSH key: $SSH_KEY"
        elif [ -f "$HOME/.ssh/id_ed25519" ]; then
            SSH_KEY="$HOME/.ssh/id_ed25519"
            print_success "Using SSH key: $SSH_KEY"
        elif [ -f "$HOME/.ssh/id_gprs_server" ]; then
            SSH_KEY="$HOME/.ssh/id_gprs_server"
            print_success "Using SSH key: $SSH_KEY"
        elif [ -f "$HOME/.ssh/id_asusme" ]; then
            SSH_KEY="$HOME/.ssh/id_asusme"
            print_success "Using SSH key: $SSH_KEY"
        elif [ -f "$HOME/.ssh/id_gprs_server" ]; then
            SSH_KEY="$HOME/.ssh/id_gprs_server"
            print_warning "Using existing key: $SSH_KEY (this key works with the server)"
            print_success "Using SSH key: $SSH_KEY"
        else
            print_error "No SSH key found. Please set up SSH key authentication."
            echo
            print_status "Option 1: Generate a new SSH key for this server:"
            print_status "  ssh-keygen -t ed25519 -f $HOME/.ssh/id_latest_vm_test -N ''"
            print_status "  ssh-copy-id -i $HOME/.ssh/id_latest_vm_test.pub $SERVER_USER@$SERVER_IP"
            echo
            print_status "Option 2: Use an existing key (update SSH_KEY variable in script):"
            print_status "  Available keys found:"
            ls -1 ~/.ssh/id_* 2>/dev/null | grep -v ".pub" | while read key; do
                print_status "    - $key"
            done
            echo
            print_status "Option 3: Test password authentication first:"
            print_status "  ssh $SERVER_USER@$SERVER_IP"
            echo
            exit 1
        fi
    else
        print_success "SSH key found: $SSH_KEY"
    fi
}

# Test SSH connection
test_ssh_connection() {
    print_status "Testing SSH connection to $SERVER_USER@$SERVER_IP..."
    if ssh -i "$SSH_KEY" -o ConnectTimeout=15 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'" > /dev/null 2>&1; then
        print_success "SSH connection successful"
    else
        print_error "Failed to connect to server. Please check your SSH configuration."
        print_status "Try connecting manually: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP"
        print_warning "If connection times out, the server may be:"
        print_warning "  - Not accessible from this network"
        print_warning "  - Behind a firewall"
        print_warning "  - Using a different IP address"
        print_warning "  - Temporarily down"
        exit 1
    fi
}

# Check Docker installation on server
check_docker() {
    print_status "Checking Docker installation on server..."
    
    # Check if docker command is available and works
    DOCKER_CHECK=$(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "docker --version 2>&1" 2>&1)
    
    if echo "$DOCKER_CHECK" | grep -q "Docker version\|version"; then
        print_success "Docker is installed and accessible"
        echo "  $DOCKER_CHECK"
        
        # Check docker-compose
        COMPOSE_CHECK=$(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
            if command -v docker-compose &> /dev/null; then
                docker-compose --version 2>&1
            elif docker compose version &> /dev/null 2>&1; then
                docker compose version 2>&1
            else
                echo 'NOT_INSTALLED'
            fi
        " 2>&1)
        
        if echo "$COMPOSE_CHECK" | grep -q "NOT_INSTALLED"; then
            print_warning "docker-compose is not installed"
            print_status "Installing docker-compose..."
            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
                if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
                    apt-get update -qq
                    apt-get install -y docker-compose-plugin || apt-get install -y docker-compose
                fi
            "
            print_success "docker-compose installation attempted"
        else
            print_success "docker-compose is available"
            echo "  $COMPOSE_CHECK"
        fi
    else
        print_error "Docker is not installed or not accessible on the server"
        print_status ""
        print_status "Please install Docker on the server first:"
        echo ""
        echo "  Quick install (run on server):"
        echo "    curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "    sudo sh get-docker.sh"
        echo "    sudo usermod -aG docker \$USER"
        echo "    sudo apt-get install -y docker-compose-plugin"
        echo "    # Then log out and back in"
        echo ""
        print_error "Deployment cannot continue without Docker. Exiting."
        exit 1
    fi
}

# Create directory on server
create_server_directory() {
    print_status "Creating directory on server: $SERVER_PATH"
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"
    print_success "Directory created"
}

# Sync files to server
sync_files() {
    print_status "Syncing files to server..."
    print_warning "This may take a few minutes..."
    
    rsync -avz --progress \
        -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.env' \
        --exclude '.env.local' \
        --exclude '.env.production' \
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
        --exclude '*.sql' \
        --exclude 'scripts/migration/*.sql' \
        --exclude 'screenshots' \
        --exclude 'docs' \
        --exclude 'deployment*.log' \
        --exclude '.next' \
        --exclude 'coverage' \
        --exclude '*.swp' \
        --exclude '*.swo' \
        --exclude '*~' \
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
    
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
        set -e
        cd /root/government_projects
        
        # Make scripts executable
        chmod +x *.sh 2>/dev/null || true
        chmod +x scripts/*.sh 2>/dev/null || true
        
        # Determine docker-compose command
        if docker compose version &> /dev/null 2>&1; then
            DOCKER_COMPOSE_CMD="docker compose"
            print_status() { echo "[INFO] $1"; }
        else
            DOCKER_COMPOSE_CMD="docker-compose"
            print_status() { echo "[INFO] $1"; }
        fi
        
        # Use production compose file if it exists, otherwise use default
        if [ -f "docker-compose.prod.yml" ]; then
            COMPOSE_FILE="docker-compose.prod.yml"
        elif [ -f "docker-compose.production.yml" ]; then
            COMPOSE_FILE="docker-compose.production.yml"
        else
            COMPOSE_FILE="docker-compose.yml"
        fi
        
        print_status "Using compose file: $COMPOSE_FILE"
        
        # Stop existing containers (if any)
        print_status "Stopping existing containers..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down 2>/dev/null || true
        
        # Remove old containers that might conflict
        print_status "Cleaning up old containers..."
        docker stop gov_react_frontend gov_node_api gov_nginx_proxy gov_postgres 2>/dev/null || true
        docker rm gov_react_frontend gov_node_api gov_nginx_proxy gov_postgres 2>/dev/null || true
        
        # Build and start containers
        print_status "Building containers (this may take several minutes)..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE build --no-cache
        
        print_status "Starting services..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE up -d
        
        # Wait for services to start
        print_status "Waiting for services to initialize..."
        sleep 10
        
        # Restart API to reconnect to database (in case of configuration changes)
        print_status "Restarting API to reconnect to database..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE restart api 2>/dev/null || true
        
        # Restart frontend to pick up latest code changes
        print_status "Restarting frontend to load latest changes..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE restart frontend 2>/dev/null || true
        
        sleep 5
        
        # Check status
        print_status "Checking container status..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps
        
        # Show logs for troubleshooting
        print_status "Recent logs from containers:"
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs --tail=20
        
        print_status "Deployment completed!"
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Application deployed successfully"
    else
        print_error "Failed to deploy application"
        print_status "Check logs on server: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose logs'"
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
    print_status "  - Admin Frontend: http://$SERVER_IP:8081/impes/"
    print_status "  - API: http://$SERVER_IP:3010/api/"
    echo
    print_status "Useful commands:"
    print_status "  - View logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose logs -f'"
    print_status "  - Restart: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose restart'"
    print_status "  - Stop: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose down'"
    print_status "  - SSH: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP"
    print_status "  - Check status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose ps'"
    echo
}

# Main execution
main() {
    print_status "Starting IMPES Application Deployment to Latest VM Test Server..."
    print_status "Target: $SERVER_USER@$SERVER_IP:$SERVER_PATH"
    echo
    
    # Run checks
    check_ssh_key
    test_ssh_connection
    echo
    
    # Check Docker installation
    check_docker
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
    echo "This script deploys the IMPES application to the latest VM test server"
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
    check_ssh_key
    print_status "DRY RUN - Showing files that would be synced..."
    rsync -avz --dry-run \
        -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
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
