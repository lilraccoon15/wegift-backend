pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build services') {
            steps {
                echo '🛠️ Building Docker images...'
                bat 'docker-compose -f docker-compose.yml build || exit /b %errorlevel%'
            }
        }

        stage('Stop existing containers') {
            steps {
                echo '🛑 Stopping running containers (if any)...'
                bat '''
                docker stop wegift-gateway-eval || echo Container gateway already stopped
                docker stop wegift-auth-service-eval || echo Container auth-service already stopped
                docker stop wegift-user-service-eval || echo Container user-service already stopped
                docker stop wegift-wishlist-service-eval || echo Container wishlist-service already stopped
                docker stop wegift-exchange-service-eval || echo Container exchange-service already stopped
                docker stop wegift-mysql-eval || echo Container mysql already stopped
                '''
            }
        }

        stage('Remove containers and volumes') {
            steps {
                echo '🧹 Cleaning up containers and volumes...'
                bat '''
                docker-compose -f docker-compose.yml down -v
                docker volume prune -f
                docker volume ls
                '''
            }
        }

        stage('Start services') {
            steps {
                echo '🚀 Starting services...'
                bat '''
                docker-compose -f docker-compose.yml up -d
                timeout /t 15 /nobreak > nul
                '''
            }
        }

        stage('Wait for MySQL') {
            steps {
                echo '⏳ Waiting for MySQL to be ready on port 3307...'
                bat '''
                setlocal enabledelayedexpansion
                set RETRY=10

                :loop
                powershell -Command "(new-object Net.Sockets.TcpClient).Connect('127.0.0.1', 3307)" >nul 2>&1
                if !errorlevel! == 0 (
                    echo ✅ MySQL is ready!
                    exit /b 0
                )
                set /a RETRY-=1
                if !RETRY! LEQ 0 (
                    echo ❌ Timeout waiting for MySQL
                    exit /b 1
                )
                timeout /t 3 >nul
                goto loop
                '''
            }
        }

        stage('Test services') {
            parallel {
                stage('Test auth-service') {
                    steps {
                        echo '🔍 Testing auth-service...'
                        bat 'docker-compose -f docker-compose.yml run --rm -e NODE_ENV=test-docker auth-service npm run test-docker || exit /b %errorlevel%'
                    }
                }
                stage('Test user-service') {
                    steps {
                        echo '🔍 Testing user-service...'
                        bat 'docker-compose -f docker-compose.yml run --rm -e NODE_ENV=test-docker user-service npm run test-docker || exit /b %errorlevel%'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '📦 Deploying services...'
                bat '''
                docker-compose -f docker-compose.yml down
                docker-compose -f docker-compose.yml up -d
                '''
            }
        }
    }
}
