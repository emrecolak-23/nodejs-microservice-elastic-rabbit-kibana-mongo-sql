import groovy.json.JsonOutput

def readCommitAuthor() {
    sh '''#!/bin/bash
        git rev-parse HEAD | tr '\n' ' ' > gitCommit
        git show --format="%aN <%aE>" ${gitCommit} | head -1 | tr '\n' ' ' > gitCommitAuthor
    '''
    return readFile('gitCommitAuthor')
}


def durationTime(m1, m2) {
    int timecase = m2 - m1

    int seconds = (int) (timecase / 1000)
    int minutes = (int) (timecase / (60*1000))
    int hours = (int) (timecase / (1000*60*60))

    return hours.mod(24) + "h " + minutes.mod(60) + "m " + seconds.mod(60) + "s"
}


def notifySlack(text, channel, attachments, String slackWebhookCredentialId = 'slack-webhook-url') {
    def jenkinsIcon = 'https://a.slack-edge.com/205a/img/services/jenkins-ci_72.png'

    withCredentials([string(credentialsId: slackWebhookCredentialId, variable: 'SLACK_WEBHOOK_URL')]) {
        def payload = JsonOutput.toJson([
            text: text,
            channel: channel,
            username: "jenkins",
            icon_url: jenkinsIcon,
            attachments: attachments
        ])

        writeFile file: 'slack-payload.json', text: payload
        def response = sh(
            script: "curl -s -w '\\n%{http_code}' -X POST \$SLACK_WEBHOOK_URL -H 'Content-Type: application/json' -d @slack-payload.json",
            returnStdout: true
        ).trim()
        sh 'rm -f slack-payload.json'
        echo "Slack webhook response: ${response}"
    }
}


def findPodsFromName(String namespace, String name) {
    def podsAndImagesRaw = sh(
        script: """
            kubectl get pods -n ${namespace} --selector=app=${name} -o jsonpath='{range .items[*]}{.metadata.name}###'
        """,
        returnStdout: true
    ).trim()
    def wantedPods = podsAndImagesRaw.split('###')

    return wantedPods
}


return this