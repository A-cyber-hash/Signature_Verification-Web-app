#!/bin/bash

# SignaSecure Enterprise Production Deployment Script
# This script sets up and runs the complete SignaSecure Enterprise platform

echo "🚀 Starting SignaSecure Enterprise Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "All dependencies are installed"
}

# Create environment file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_info "Creating environment configuration..."
        cat > .env << EOL
# SignaSecure Enterprise Environment Configuration

# Database Configuration
MYSQL_ROOT_PASSWORD=SignaSecure2024!Root
MYSQL_DATABASE=signasecure_enterprise
MYSQL_USER=signasecure
MYSQL_PASSWORD=SignaSecure2024!DB

# Django Configuration
SECRET_KEY=$(openssl rand -base64 32)
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,signasecure.local

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@signasecure.com

# Security Configuration
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# AI Model Configuration
AI_MODEL_PATH=/app/ai_models
FRAUD_DETECTION_THRESHOLD=0.7
ACCURACY_THRESHOLD=0.85

# Monitoring
SENTRY_DSN=your-sentry-dsn-here
EOL
        print_status "Environment file created: .env"
        print_warning "Please review and update the .env file with your actual configuration"
    else
        print_status "Environment file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    directories=(
        "nginx/ssl"
        "database/init"
        "backend/logs"
        "backend/staticfiles"
        "backend/media"
        "frontend/dist"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    print_info "Generating SSL certificates..."
    
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=CA/L=San Francisco/O=SignaSecure/OU=IT/CN=localhost"
        
        print_status "SSL certificates generated"
        print_warning "These are self-signed certificates for development only"
    else
        print_status "SSL certificates already exist"
    fi
}

# Create Nginx configuration
create_nginx_config() {
    print_info "Creating Nginx configuration..."
    
    cat > nginx/nginx.conf << 'EOL'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:80;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name localhost;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        
        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Admin routes
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Media files
        location /media/ {
            alias /var/www/media/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOL
    
    print_status "Nginx configuration created"
}

# Initialize database
init_database() {
    print_info "Initializing database..."
    
    # Wait for MySQL to be ready
    print_info "Waiting for MySQL to be ready..."
    sleep 30
    
    # Run migrations
    docker-compose exec backend python manage.py migrate
    
    # Create superuser if it doesn't exist
    docker-compose exec backend python manage.py shell << 'PYTHON'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@signasecure.com').exists():
    User.objects.create_superuser('admin@signasecure.com', 'admin', 'SignaSecure2024!')
    print("Superuser created: admin@signasecure.com / SignaSecure2024!")
else:
    print("Superuser already exists")
PYTHON
    
    print_status "Database initialized"
}

# Start services
start_services() {
    print_info "Starting SignaSecure Enterprise services..."
    
    # Build and start services
    docker-compose up -d --build
    
    print_status "Services started successfully!"
    
    # Show service status
    echo ""
    print_info "Service Status:"
    docker-compose ps
    
    echo ""
    print_info "Access URLs:"
    echo "🌐 Frontend: https://localhost"
    echo "🔧 Admin Panel: https://localhost/admin"
    echo "📚 API Documentation: https://localhost/api/docs"
    echo ""
    print_info "Default Admin Credentials:"
    echo "📧 Email: admin@signasecure.com"
    echo "🔑 Password: SignaSecure2024!"
}

# Monitor services
monitor_services() {
    print_info "Monitoring services... Press Ctrl+C to stop"
    docker-compose logs -f
}

# Stop services
stop_services() {
    print_info "Stopping SignaSecure Enterprise services..."
    docker-compose down
    print_status "Services stopped"
}

# Clean up everything
cleanup() {
    print_warning "This will remove all containers, volumes, and data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "===========================================" 
    echo "🔐 SignaSecure Enterprise Control Panel"
    echo "==========================================="
    echo "1. 🚀 Deploy (Full Setup)"
    echo "2. ▶️  Start Services"
    echo "3. ⏹️  Stop Services" 
    echo "4. 📊 Monitor Logs"
    echo "5. 🗄️  Initialize Database"
    echo "6. 🧹 Cleanup Everything"
    echo "7. ❓ Check Status"
    echo "8. 🚪 Exit"
    echo "==========================================="
    echo -n "Select an option (1-8): "
}

# Check service status
check_status() {
    print_info "Service Status:"
    docker-compose ps
    
    echo ""
    print_info "Container Health:"
    docker-compose exec backend python manage.py check --deploy 2>/dev/null || print_error "Backend health check failed"
    
    echo ""
    print_info "Database Status:"
    docker-compose exec mysql mysql -u root -pSignaSecure2024!Root -e "SELECT 'MySQL is running' as status;" 2>/dev/null || print_error "Database connection failed"
}

# Main execution
main() {
    # Handle command line arguments
    case "$1" in
        "deploy")
            check_dependencies
            create_env_file
            create_directories
            generate_ssl_certificates
            create_nginx_config
            start_services
            init_database
            ;;
        "start")
            docker-compose up -d
            ;;
        "stop")
            stop_services
            ;;
        "monitor")
            monitor_services
            ;;
        "status")
            check_status
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            # Interactive menu
            while true; do
                show_menu
                read -r choice
                case $choice in
                    1)
                        check_dependencies
                        create_env_file
                        create_directories
                        generate_ssl_certificates
                        create_nginx_config
                        start_services
                        sleep 30
                        init_database
                        ;;
                    2)
                        docker-compose up -d
                        ;;
                    3)
                        stop_services
                        ;;
                    4)
                        monitor_services
                        ;;
                    5)
                        init_database
                        ;;
                    6)
                        cleanup
                        ;;
                    7)
                        check_status
                        ;;
                    8)
                        print_info "Goodbye!"
                        exit 0
                        ;;
                    *)
                        print_error "Invalid option. Please choose 1-8."
                        ;;
                esac
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

# Run main function with all arguments
main "$@"