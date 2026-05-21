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
                        cp $ENV_FILE infra/.env
                        cd infra
                        docker compose down
                        docker compose build --no-cache
                        docker compose up -d
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
