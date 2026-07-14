# Static front end for EHTravel on Railway. Serves index.html + src/** + ui-tokens.json
# via Caddy on Railway's $PORT. The GraphQL endpoint is injected at container start from
# the GRAPHQL_ENDPOINT env var (set it to the deployed router's URL).
FROM caddy:2-alpine
WORKDIR /srv
COPY index.html ui-tokens.json ./
COPY src ./src
COPY web-entrypoint.sh /usr/local/bin/web-entrypoint.sh
RUN chmod +x /usr/local/bin/web-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/web-entrypoint.sh"]
