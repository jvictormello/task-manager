FROM node:20.19-alpine

WORKDIR /app

# Speed up installs
ENV CI=true

# Add git and bash for tooling that may expect them
RUN apk add --no-cache git bash

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","3000"]
