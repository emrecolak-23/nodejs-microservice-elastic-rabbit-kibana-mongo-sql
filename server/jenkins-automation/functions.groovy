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


def findPodsFromName(String namespace, String name) {
    podsAndImagesRaw = sh(
        script: """
            kubectl get pods -n ${namespace} --selector=app=${name} -o jsonpath='{range .items[*]}{.metadata.name}###'
        """,
        returnStdout: true
    ).trim()
    wantedPods = podsAndImagesRaw.split('###')

    return wantedPods
}


return this