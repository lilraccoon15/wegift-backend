pipeline {
    agent any

    environment {
        DB_USER = credentials('jenkins-db-user-id')
        DB_PASS = credentials('jenkins-db-pass-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Copy env files') {
            steps {
                withCredentials([
                    file(credentialsId: 'wegift-env-auth', variable: 'AUTH_ENV'),
                    file(credentialsId: 'wegift-env-user', variable: 'USER_ENV'),
                    file(credentialsId: 'wegift-env-wishlist', variable: 'WISHLIST_ENV'),
                    file(credentialsId: 'wegift-env-exchange', variable: 'EXCHANGE_ENV'),
                    file(credentialsId: 'wegift-env-notification', variable: 'NOTIFICATION_ENV'),
                    file(credentialsId: 'wegift-env-gateway', variable: 'GATEWAY_ENV'),

                    file(credentialsId: 'wegift-env-auth-test', variable: 'AUTH_ENV_TEST'),
                    file(credentialsId: 'wegift-env-user-test', variable: 'USER_ENV_TEST'),
                    file(credentialsId: 'wegift-env-wishlist-test', variable: 'WISHLIST_ENV_TEST'),
                    file(credentialsId: 'wegift-env-exchange-test', variable: 'EXCHANGE_ENV_TEST'),
                    file(credentialsId: 'wegift-env-notification-test', variable: 'NOTIFICATION_ENV_TEST')
                ]) {
                    bat '''
                    copy %AUTH_ENV% services\\auth-service\\.env.docker
                    copy %USER_ENV% services\\user-service\\.env.docker
                    copy %WISHLIST_ENV% services\\wishlist-service\\.env.docker
                    copy %EXCHANGE_ENV% services\\exchange-service\\.env.docker
                    copy %NOTIFICATION_ENV% services\\notification-service\\.env.docker
                    copy %GATEWAY_ENV% gateway\\.env.docker

                    copy %AUTH_ENV_TEST% services\\auth-service\\.env.test
                    copy %USER_ENV_TEST% services\\user-service\\.env.test
                    copy %WISHLIST_ENV_TEST% services\\wishlist-service\\.env.test
                    copy %EXCHANGE_ENV_TEST% services\\exchange-service\\.env.test
                    copy %NOTIFICATION_ENV_TEST% services\\notification-service\\.env.test
                    '''
                }
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
                stage('Install notification-service') {
                    steps {
                        bat 'docker compose run --rm notification-service npm install --production'
                    }
                }
                stage('Install gateway') {
                    steps {
                        bat 'docker compose run --rm gateway npm install --production'
                    }
                }
            }
        }

        stage('Start services') {
            steps {
                bat 'docker compose down'
                bat 'docker compose up -d'
                bat 'ping -n 16 127.0.0.1 > nul'
            }
        }

        stage('Test services') {
            parallel {
                stage('Test auth-service') {
                    steps {
                        bat 'docker compose run --rm -e NODE_ENV=test auth-service npm run test'
                    }
                }
                stage('Test user-service') {
                    steps {
                        bat 'docker compose run --rm -e NODE_ENV=test user-service npm run test'
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
