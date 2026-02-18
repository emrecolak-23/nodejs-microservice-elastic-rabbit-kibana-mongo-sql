FROM jenkins/ssh-agent:jdk17

USER root

ARG NODE_VERSION=25.6.1
RUN apt-get update && apt-get install -y curl xz-utils \
    && ARCH=$(dpkg --print-architecture) \
    && NODE_ARCH=$([ "$ARCH" = "amd64" ] && echo "x64" || echo "arm64") \
    && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" | tar -xJ -C /usr/local --strip-components=1 \
    && npm install -g pnpm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER jenkins
