pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Debug') {
            steps {
                sh 'pwd && ls -la'
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'infra-env', variable: 'ENV_FILE')]) {
                    sh '''
                      ls -la infra/
                      cp "$ENV_FILE" infra/.env
                      chmod 644 infra/.env
                      ls -la infra/
                      cd infra
                      docker compose down --remove-orphans
                      docker compose build --no-cache
                      docker compose up -d --build --quiet-pull
                        '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deploy thành công!'
        }
        failure {
            echo 'Deploy thất bại!'
        }
    }
}
