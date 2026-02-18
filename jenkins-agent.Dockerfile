FROM jenkins/ssh-agent:jdk17

USER root

COPY --from=node:25-bookworm-slim /usr/local /usr/local

# Node için gerekli shared library
RUN apt-get update && apt-get install -y libatomic1 \
    && npm install -g pnpm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER jenkins
