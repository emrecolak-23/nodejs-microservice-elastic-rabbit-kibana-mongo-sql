FROM elastic/heartbeat:8.17.0
COPY heartbeat.yml /usr/share/heartbeat/heartbeat.yml
USER root