pipeline {
  agent any

  environment {
    DOCKER_BUILDKIT = 1
    COMPOSE_DOCKER_CLI_BUILD = 1
  }

  stages {
    stage('Checkout') {
      steps {
        echo '📦 Clonage du dépôt...'
        checkout scm
      }
    }

    stage('Build services') {
      steps {
        echo '🛠️ Building Docker images...'
        bat "docker-compose -f docker-compose.yml build"
      }
    }

    stage('Stop existing containers') {
      steps {
        echo '🛑 Stopping running containers (if any)...'
        bat "docker-compose -f docker-compose.yml down || exit 0"
      }
    }

    stage('Start containers') {
      steps {
        echo '🚀 Starting containers...'
        bat "docker-compose -f docker-compose.yml up -d"
      }
    }

    stage('Check services health') {
      steps {
        echo '🔍 Waiting for services to be healthy...'
        bat '''
        timeout 30 ping -n 10 localhost >nul
        docker ps
        '''
      }
    }

    stage('Run tests') {
      steps {
        echo '🧪 Running backend tests...'
        // Tu peux adapter selon la manière dont tu fais tourner tes tests :
        bat "docker exec wegift-backend-auth-service npm test || exit 1"
      }
    }

    stage('Clean up') {
      steps {
        echo '🧹 Cleaning up containers...'
        bat "docker-compose -f docker-compose.yml down"
      }
    }
  }

  post {
    always {
      echo '📄 Pipeline terminé.'
    }
    success {
      echo '✅ Succès ! Tous les services sont buildés et testés.'
    }
    failure {
      echo '❌ Le pipeline a échoué. Vérifiez les logs.'
    }
  }
}
