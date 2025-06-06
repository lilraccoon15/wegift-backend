pipeline {
    agent {
        docker {
            image 'docker/compose:1.29.2'  // Image officielle avec docker + docker-compose
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
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
                sh 'docker-compose build'
            }
        }
        
        stage('Test services') {
            parallel {
                stage('Test auth-service') {
                    steps {
                        sh '''
                        docker-compose run --rm auth-service npm install
                        docker-compose run --rm auth-service npm test
                        '''
                    }
                }
                stage('Test user-service') {
                    steps {
                        sh '''
                        docker-compose run --rm user-service npm install
                        docker-compose run --rm user-service npm test
                        '''
                    }
                }
                stage('Test wishlist-service') {
                    steps {
                        sh '''
                        docker-compose run --rm wishlist-service npm install
                        docker-compose run --rm wishlist-service npm test
                        '''
                    }
                }
                stage('Test exchange-service') {
                    steps {
                        sh '''
                        docker-compose run --rm exchange-service npm install
                        docker-compose run --rm exchange-service npm test
                        '''
                    }
                }
                stage('Test gateway') {
                    steps {
                        sh '''
                        docker-compose run --rm gateway npm install
                        docker-compose run --rm gateway npm test
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker-compose down
                docker-compose up -d
                '''
            }
        }
    }
}
