pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t monapp-node .'
            }
        }

        stage('Deploy Docker container') {
            steps {
                sh '''
                    docker stop monapp-node || true
                    docker rm monapp-node || true
                    docker run -d --name monapp-node -p 3000:3000 monapp-node
                '''
            }
        }
    }
}
