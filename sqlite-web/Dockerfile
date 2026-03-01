FROM python:3.12-alpine

RUN pip install --no-cache-dir sqlite-web==0.7.1 flask==2.3.3

WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]

