pipeline {
    agent any

    stages {
        stage('Build') { 
            steps {
                echo "before installing"
                sh 'npm install' 
                echo "after installing"
            }
        }
        stage('Test') { 
            steps {
                echo 'Testing' 
            }
        }
        stage('Deploy') { 
            steps {
                echo 'Deploying' 
            }
        }
    }
    post {
        always {
            echo 'This will always run'
        }
        failure {
            echo 'This will run only if failed'
        }
        changed {
            echo 'This will run only if the state of the Pipeline has changed'
        }
    }
}
