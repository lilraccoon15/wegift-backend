pipeline {
    agent any 

    environment {
        COMPOSE_FILE = 'docker-compose.yml'

        DB_USER = credentials('jenkins-db-user-id')
        DB_PASS = credentials('jenkins-db-pass-id')

        DB_HOST = 'localhost'
        DB_PORT = '5432'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare env files') {
            steps {
                bat '''
                echo DB_USER=%DB_USER%> services\\auth-service\\.env
                echo DB_PASS=%DB_PASS%>> services\\auth-service\\.env
                echo DB_HOST=%DB_HOST%>> services\\auth-service\\.env
                echo DB_PORT=%DB_PORT%>> services\\auth-service\\.env

                echo DB_USER=%DB_USER%> services\\user-service\\.env
                echo DB_PASS=%DB_PASS%>> services\\user-service\\.env
                echo DB_HOST=%DB_HOST%>> services\\user-service\\.env
                echo DB_PORT=%DB_PORT%>> services\\user-service\\.env

                echo DB_USER=%DB_USER%> services\\wishlist-service\\.env
                echo DB_PASS=%DB_PASS%>> services\\wishlist-service\\.env
                echo DB_HOST=%DB_HOST%>> services\\wishlist-service\\.env
                echo DB_PORT=%DB_PORT%>> services\\wishlist-service\\.env

                echo DB_USER=%DB_USER%> services\\exchange-service\\.env
                echo DB_PASS=%DB_PASS%>> services\\exchange-service\\.env
                echo DB_HOST=%DB_HOST%>> services\\exchange-service\\.env
                echo DB_PORT=%DB_PORT%>> services\\exchange-service\\.env

                echo DB_HOST=%DB_HOST%> gateway\\.env.docker
                echo DB_PORT=%DB_PORT%>> gateway\\.env.docker
                '''
            }
        }

        stage('Build services') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Install dependencies') {
            parallel {
                stage('Install auth-service') {
                    steps {
                        bat 'docker compose run --rm auth-service npm install --production'
                    }
                }
                stage('Install user-service') {
                    steps {
                        bat 'docker compose run --rm user-service npm install --production'
                    }
                }
                stage('Install wishlist-service') {
                    steps {
                        bat 'docker compose run --rm wishlist-service npm install --production'
                    }
                }
                stage('Install exchange-service') {
                    steps {
                        bat 'docker compose run --rm exchange-service npm install --production'
                    }
                }
                stage('Install gateway') {
                    steps {
                        bat 'docker compose run --rm gateway npm install --production'
                    }
                }
            }
        }

        stage('Test services') {
            parallel {
                stage('Test auth-service') {
                    steps {
                        bat 'docker compose run --rm auth-service npm test'
                    }
                }
                stage('Test user-service') {
                    steps {
                        bat 'docker compose run --rm user-service npm test'
                    }
                }
                stage('Test wishlist-service') {
                    steps {
                        bat 'docker compose run --rm wishlist-service npm test'
                    }
                }
                stage('Test exchange-service') {
                    steps {
                        bat 'docker compose run --rm exchange-service npm test'
                    }
                }
                stage('Test gateway') {
                    steps {
                        bat 'docker compose run --rm gateway npm test'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                bat '''
                docker compose down
                docker compose up -d
                '''
            }
        }
    }
}
