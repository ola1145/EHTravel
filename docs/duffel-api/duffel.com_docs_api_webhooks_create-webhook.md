---
url: "https://duffel.com/docs/api/webhooks/create-webhook"
title: "Webhooks | Duffel Documentation"
---

* * *

# Webhooks

Webhooks are used to automatically receive notifications of events that happen. For example, when
an order has a schedule change.

Once you receive an event on your server, you can process and act on it as you need.

You can manage your webhooks on the [Duffel Dashboard](https://app.duffel.com/developers/webhooks).

## Events

Events have the following general shape:

```
{
  "id": "wev_0000A4tQSmKyqOrcySrGbo",
  "api_version": "v2",
  "type": "order.created",
  "data": {
    "object": { .. },
  },
  "live_mode": true,
  "idempotency_key": "ord_0000ABd6wggSct7BoraU1o",
  "created_at": "2020-04-11T15:48:11.642000Z",
  "identity_organisation_id": "org_0000APMFjhs4X2rJ6k7UIE"
}
```

The `api_version` represents the version of our API that produced the `data` property.

We'll progressively add more events. The currently supported events and their payload can be found in [our documentation](https://duffel.com/docs/api/v2/webhook-events/schema#webhook-events-schema-data).

## System guarantees

Duffel's webhooks system guarantees the following properties:

- It makes **at least one** delivery attempt per event.

- Events are **not** delivered in any particular **order**.

- Events are sent **at least once**.

- Failed deliveries are retried for **72 hours** on an exponetial backoff policy.


It also has the following security properties:

- It always makes **HTTPS** requests.

- It **signs** the events.


## Schema

**active**

booleanlink icon

Whether the webhook receiver is actively being notified or not

Example:`true`

**created\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime at which the webhook was created

Example:`"2020-04-11 15:48:11.642000+00:00"`

**events**

string\[\]link icon

The events that this webhook will be subscribed to

Example:`["order.created","order.airline_initiated_change_detected"]`

**id**

stringlink icon

Duffel's unique identifier for the webhook receiver

Example:`"end_0000A3tQSmKyqOrcySrGbo"`

**live\_mode**

booleanlink icon

The live mode that the webhook was created in. It will _only_ receive events for that same live mode. For example, you won't receive `order.created` events for orders that you created in the sandbox, if your webhook is for `live_mode: true`.

Example:`true`

**updated\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime at which the webhook was updated

Example:`"2020-04-11 15:48:11.642000+00:00"`

**url**

stringlink icon

The URL where your webhook will be received

Example:`"https://www.example.com:4000/webhooks"`

## Ping a webhook

Send a ping, a "fake event" notification, to a webhook

### URL parameters

**id**

stringrequiredlink icon

Duffel's unique identifier for the webhook receiver

Example:`"end_0000A3tQSmKyqOrcySrGbo"`

Endpoint

copy

```bash
POST https://api.duffel.com/air/webhooks/{id}/actions/ping
```

Request

curlNode.JS

copy

```bash

curl -X POST --compressed "https://api.duffel.com/air/webhooks/{id}/actions/ping" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Response

copy

```javascript
No response body
```

## Delete a webhook

Delete a webhook

### URL parameters

**id**

stringrequiredlink icon

Duffel's unique identifier for the webhook receiver

Example:`"end_0000A3tQSmKyqOrcySrGbo"`

Endpoint

copy

```bash
DELETE https://api.duffel.com/air/webhooks/{id}
```

Request

curlNode.JS

copy

```bash

curl -X DELETE --compressed "https://api.duffel.com/air/webhooks/{id}" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Response

copy

```javascript
No response body
```

## Update a webhook

Update a webhook

### URL parameters

**id**

stringrequiredlink icon

Duffel's unique identifier for the webhook receiver

Example:`"end_0000A3tQSmKyqOrcySrGbo"`

### Body parameters

**active**

booleanlink icon

The desired active status of the webhook

Example:`true`

**events**

string\[\]link icon

The desired events that the webhook should subscribe to

Example:`["order.created","order.airline_initiated_change_detected"]`

**url**

stringlink icon

The desired url of the webhook

Example:`"https://example.com/duffel/webhook"`

Endpoint

copy

```bash
PATCH https://api.duffel.com/air/webhooks/{id}
```

Request

curlNode.JS

copy

```bash

curl -X PATCH --compressed "https://api.duffel.com/air/webhooks/{id}" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \

  -d '{

  "data": {

    "url": "https://example.com/duffel/webhook",

    "events": [\
\
      "order.created",\
\
      "order.airline_initiated_change_detected"\
\
    ],

    "active": true

  }

}'
```

Response

copy

```json
{
  "data": {
    "url": "https://www.example.com:4000/webhooks",
    "updated_at": "2020-04-11 15:48:11.642000+00:00",
    "live_mode": true,
    "id": "end_0000A3tQSmKyqOrcySrGbo",
    "events": [\
      "order.created",\
      "order.airline_initiated_change_detected"\
    ],
    "created_at": "2020-04-11 15:48:11.642000+00:00",
    "active": true
  }
}
```

## List webhooks

Retrieve a paginated list of webhooks

### Query parameters

**limit**

integerlink icon

The maximum number of records to return per page. Defaults to `50`.
May be set to any integer between `1` and `200`. For more information on how to paginate through records, see the [Pagination](https://duffel.com/docs/api/overview/pagination) section.

Example:`1`

Default value:`50`

**before**

stringlink icon

A cursor pointing to the next page of records. For more information on how to paginate through records, see the [Pagination](https://duffel.com/docs/api/overview/pagination) section.

Example:`"g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB="`

**after**

stringlink icon

A cursor pointing to the previous page of records. For more information on how to paginate through records, see the [Pagination](https://duffel.com/docs/api/overview/pagination) section.

Example:`"g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB="`

Endpoint

copy

```bash
GET https://api.duffel.com/air/webhooks
```

Request

curlNode.JS

copy

```bash

curl -X GET --compressed "https://api.duffel.com/air/webhooks?limit=1&before=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=&after=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=" \

  -H "Accept: application/json" \

  -H "Accept-Encoding: gzip" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Response

copy

```json
{
  "meta": {
    "limit": 50,
    "after": "g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB="
  },
  "data": [\
    {\
      "url": "https://www.example.com:4000/webhooks",\
      "updated_at": "2020-04-11 15:48:11.642000+00:00",\
      "live_mode": true,\
      "id": "end_0000A3tQSmKyqOrcySrGbo",\
      "events": [\
        "order.created",\
        "order.airline_initiated_change_detected"\
      ],\
      "created_at": "2020-04-11 15:48:11.642000+00:00",\
      "active": true\
    }\
  ]
}
```

## Create a webhook

To start receiving notifications of events, you'll need to create a webhook that details the
server that will receive the notifications. The webhook will be created in live mode or test
mode based on the access token you're using. If you're using a test mode access token, the
webhook will be created in test mode and will receive events related to test mode resources.
If you're using a live mode access token, it'll receive events related to live mode.

Duffel only allows one webhook to be defined per live mode value, basically your organisation can only have
one url with `live_mode: true` and another with `live_mode: false`.

To ensure the highest level of security we run some checks on the URL we receive, the URL must be
for an https server, we do not accept IP addresses and some URLs are blacklisted (e.g. [https://localhost](https://localhost/)).

By default, the webhook will be active.

### Body parameters

**events**

string\[\]requiredlink icon

The events that this webhook will be subscribed to

Example:`["order.created","order.airline_initiated_change_detected"]`

**url**

stringrequiredlink icon

The URL where your webhook will be received

Example:`"https://www.example.com/webhooks"`

Endpoint

copy

```bash
POST https://api.duffel.com/air/webhooks
```

Request

curlNode.JS

copy

```bash

curl -X POST --compressed "https://api.duffel.com/air/webhooks" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Content-Type: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \

  -d '{

  "data": {

    "url": "https://www.example.com/webhooks",

    "events": [\
\
      "order.created",\
\
      "order.airline_initiated_change_detected"\
\
    ]

  }

}'
```

Response

copy

```json
{
  "data": {
    "secret": "QKfUULLQh+8SegYmIsF6kA==",
    "url": "https://www.example.com:4000/webhooks",
    "updated_at": "2020-04-11 15:48:11.642000+00:00",
    "live_mode": true,
    "id": "end_0000A3tQSmKyqOrcySrGbo",
    "events": [\
      "order.created",\
      "order.airline_initiated_change_detected"\
    ],
    "created_at": "2020-04-11 15:48:11.642000+00:00",
    "active": true
  }
}
```

We use cookies to improve your experience and for marketing. [See our cookie policy.](https://duffel.com/cookies-policy)

Allow allReject allManage cookies