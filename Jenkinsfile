pipeline {
    agent any 

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build services') {
            steps {
                bat 'docker compose build'
            }
        }
        stage('Test services') {
            parallel {
                stage('Test auth-service') {
                    steps {
                        bat '''
                        docker compose run --rm auth-service npm install
                        docker compose run --rm auth-service npm test
                        '''
                    }
                }
                stage('Test user-service') {
                    steps {
                        bat '''
                        docker compose run --rm user-service npm install
                        docker compose run --rm user-service npm test
                        '''
                    }
                }
                stage('Test wishlist-service') {
                    steps {
                        bat '''
                        docker compose run --rm wishlist-service npm install
                        docker compose run --rm wishlist-service npm test
                        '''
                    }
                }
                stage('Test exchange-service') {
                    steps {
                        bat '''
                        docker compose run --rm exchange-service npm install
                        docker compose run --rm exchange-service npm test
                        '''
                    }
                }
                stage('Test gateway') {
                    steps {
                        bat '''
                        docker compose run --rm gateway npm install
                        docker compose run --rm gateway npm test
                        '''
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
