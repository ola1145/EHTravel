# Apollo Router serving the EHTravel supergraph (Duffel connectors).
# Connectors require Apollo Router v2+. The Duffel token is provided at RUNTIME via
# the DUFFEL_API_TOKEN env var — it is never baked into the image.
#
#   docker build -f graphql/Dockerfile -t ehtravel-router .
#   docker run -p 4000:4000 -e DUFFEL_API_TOKEN=duffel_test_xxx ehtravel-router
#
# Prereq: run `npm run compose` first so graphql/supergraph.graphql exists.
# v2.16.0 supports Apollo Connectors connect/v0.3 (v2.0.0 does not — "Unknown connect version: 0.3").
FROM ghcr.io/apollographql/router:v2.16.0

COPY graphql/router.yaml       /dist/config/router.yaml
COPY graphql/supergraph.graphql /dist/config/supergraph.graphql

ENV APOLLO_ROUTER_CONFIG_PATH=/dist/config/router.yaml
ENV APOLLO_ROUTER_SUPERGRAPH_PATH=/dist/config/supergraph.graphql
# APOLLO_ELV2_LICENSE / running the router constitutes acceptance of the Elastic License v2.

EXPOSE 4000
