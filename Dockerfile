FROM docker.io/cloudflare/sandbox:0.12.10

# Documents the ports this application uses (standard Docker convention)
EXPOSE 8080

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       python3 \
       default-jdk \
       g++ \
       dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/*
