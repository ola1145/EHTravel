---
url: "https://duffel.com/docs/api/v2/offer-requests/schema"
title: "Offer Requests | Duffel Documentation"
---

* * *

# Offer Requests

To search for flights, you'll need to create an offer request. An offer request describes the passengers and
where and when they want to travel (in the form of a list of slices). It may also include additional filters (e.g.
a particular cabin to travel in).

## Schema

Expand allunfold\_more icon

**airline\_credit\_ids**

string\[\]link icon

The IDs of airline credits to be used when searching for offers. These credits will be evaluated for applicability to the returned offers and included in the `available_airline_credits` field of compatible offers.

Example:`["acd_00009htYpSCXrwaB9DnUm1","acd_00009htYpSCXrwaB9DnUm2"]`

**cabin\_class**

enumnullablelink icon

The cabin that the passengers want to travel in

Possible values:`"first"`, `"business"`, `"premium_economy"`, or `"economy"`

**client\_key**

stringlink icon

A client key to allow the Duffel Ancillaries component to talk to the Duffel API to retrieve information about an offer and its ancillaries. Learn more about how to use this on [https://duffel.com/docs/guides/ancillaries-component](https://duffel.com/docs/guides/ancillaries-component).

Example:`"SFMyNTY.g2gDdAAAAANkAAlsaXZlX21vZGVkAAVmYWxzZWQAD29yZ2FuaXNhdGlvbl9pZG0AAAAab3JnXzAwMDA5VWhGY29ERGk5TTFTRjhiS2FkAAtyZXNvdXJjZV9pZG0AAAAab3JxXzAwMDBBVkZWZnFJUXFBWXpYeVRRVlVuBgDpOCvdhwFiAAFRgA.df1RmLeBFUR7r1WFHHiEksilfSZNLhmPX0nj5VOKWJ4"`

**created\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime at which the offer request was created

Example:`"2020-02-12T15:21:01.927Z"`

**id**

stringlink icon

Duffel's unique identifier for the resource

Example:`"orq_00009hjdomFOCJyxHG7k7k"`

**live\_mode**

booleanlink icon

Whether the offer request was created in live mode. This field will be set to `true` if the offer request was created in live mode, or `false` if it was created in test mode.

Example:`false`

**offers**

listlink icon

The offers returned by the airlines

**passengers**

listlink icon

The passengers who want to travel

**slices**

listlink icon

The [slices](https://duffel.com/docs/api/overview/key-concepts) that make up this offer request. One-way journeys can be expressed using one slice, whereas return trips will need two.

## List offer requests

Retrieves a paginated list of your offer requests. The results may be returned in any order.

### Query parameters

**after**

stringlink icon

A cursor pointing to the previous page of records. For more information on how to paginate through records, see the [Pagination](https://duffel.com/docs/api/overview/pagination) section.

Example:`"g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB="`

**before**

stringlink icon

A cursor pointing to the next page of records. For more information on how to paginate through records, see the [Pagination](https://duffel.com/docs/api/overview/pagination) section.

Example:`"g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB="`

**limit**

integerlink icon

The maximum number of records to return per page. Defaults to `50`.
May be set to any integer between `1` and `200`. For more information on how to paginate through records, see the [Pagination](https://duffel.com/docs/api/overview/pagination) section.

Example:`1`

Default value:`50`

Endpoint

copy

```bash
GET https://api.duffel.com/air/offer_requests
```

Request

curlNode.JS

copy

```bash

curl -X GET --compressed "https://api.duffel.com/air/offer_requests?after=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=&before=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=&limit=1" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

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
      "slices": [\
        {\
          "origin_type": "airport",\
          "origin": {\
            "type": "airport",\
            "time_zone": "Europe/London",\
            "name": "Heathrow",\
            "longitude": -141.951519,\
            "latitude": 64.068865,\
            "id": "arp_lhr_gb",\
            "icao_code": "EGLL",\
            "iata_country_code": "GB",\
            "iata_code": "LHR",\
            "iata_city_code": "LON",\
            "city_name": "London",\
            "city": {\
              "name": "London",\
              "id": "cit_lon_gb",\
              "iata_country_code": "GB",\
              "iata_code": "LON",\
              "airports": [\
                {\
                  "time_zone": "Europe/London",\
                  "name": "Heathrow",\
                  "longitude": -141.951519,\
                  "latitude": 64.068865,\
                  "id": "arp_lhr_gb",\
                  "icao_code": "EGLL",\
                  "iata_country_code": "GB",\
                  "iata_code": "LHR"\
                }\
              ]\
            },\
            "airports": [\
              {\
                "time_zone": "Europe/London",\
                "name": "Heathrow",\
                "longitude": -141.951519,\
                "latitude": 64.068865,\
                "id": "arp_lhr_gb",\
                "icao_code": "EGLL",\
                "iata_country_code": "GB",\
                "iata_code": "LHR",\
                "iata_city_code": "LON",\
                "city_name": "London",\
                "city": {\
                  "name": "London",\
                  "id": "cit_lon_gb",\
                  "iata_country_code": "GB",\
                  "iata_code": "LON",\
                  "airports": [\
                    {\
                      "time_zone": "Europe/London",\
                      "name": "Heathrow",\
                      "longitude": -141.951519,\
                      "latitude": 64.068865,\
                      "id": "arp_lhr_gb",\
                      "icao_code": "EGLL",\
                      "iata_country_code": "GB",\
                      "iata_code": "LHR"\
                    }\
                  ]\
                }\
              }\
            ]\
          },\
          "destination_type": "airport",\
          "destination": {\
            "type": "airport",\
            "time_zone": "Europe/London",\
            "name": "Heathrow",\
            "longitude": -141.951519,\
            "latitude": 64.068865,\
            "id": "arp_lhr_gb",\
            "icao_code": "EGLL",\
            "iata_country_code": "GB",\
            "iata_code": "LHR",\
            "iata_city_code": "LON",\
            "city_name": "London",\
            "city": {\
              "name": "London",\
              "id": "cit_lon_gb",\
              "iata_country_code": "GB",\
              "iata_code": "LON",\
              "airports": [\
                {\
                  "time_zone": "Europe/London",\
                  "name": "Heathrow",\
                  "longitude": -141.951519,\
                  "latitude": 64.068865,\
                  "id": "arp_lhr_gb",\
                  "icao_code": "EGLL",\
                  "iata_country_code": "GB",\
                  "iata_code": "LHR"\
                }\
              ]\
            },\
            "airports": [\
              {\
                "time_zone": "Europe/London",\
                "name": "Heathrow",\
                "longitude": -141.951519,\
                "latitude": 64.068865,\
                "id": "arp_lhr_gb",\
                "icao_code": "EGLL",\
                "iata_country_code": "GB",\
                "iata_code": "LHR",\
                "iata_city_code": "LON",\
                "city_name": "London",\
                "city": {\
                  "name": "London",\
                  "id": "cit_lon_gb",\
                  "iata_country_code": "GB",\
                  "iata_code": "LON",\
                  "airports": [\
                    {\
                      "time_zone": "Europe/London",\
                      "name": "Heathrow",\
                      "longitude": -141.951519,\
                      "latitude": 64.068865,\
                      "id": "arp_lhr_gb",\
                      "icao_code": "EGLL",\
                      "iata_country_code": "GB",\
                      "iata_code": "LHR"\
                    }\
                  ]\
                }\
              }\
            ]\
          },\
          "departure_date": "2020-04-24"\
        }\
      ],\
      "live_mode": false,\
      "id": "orq_00009hjdomFOCJyxHG7k7k",\
      "created_at": "2020-02-12T15:21:01.927Z",\
      "client_key": "SFMyNTY.g2gDdAAAAANkAAlsaXZlX21vZGVkAAVmYWxzZWQAD29yZ2FuaXNhdGlvbl9pZG0AAAAab3JnXzAwMDA5VWhGY29ERGk5TTFTRjhiS2FkAAtyZXNvdXJjZV9pZG0AAAAab3JxXzAwMDBBVkZWZnFJUXFBWXpYeVRRVlVuBgDpOCvdhwFiAAFRgA.df1RmLeBFUR7r1WFHHiEksilfSZNLhmPX0nj5VOKWJ4",\
      "cabin_class": "economy"\
    }\
  ]
}
```

...

View full sample

## Create an offer request

To search for flights, you'll need to create an offer request. An offer request describes the passengers and
where and when they want to travel (in the form of a list of slices). It may also include additional filters (e.g.
a particular cabin to travel in).

We'll send your search to a range of airlines, and return your offer request back to you with a series of offers.

Each offer represents a set of flights you can buy from an airline at a particular price that meet your search criteria.

Inside the offers, you'll see your slices, but now each slice will also include a list of one or more specific flights (called
segments) that the airline is _offering_ to get the passengers where they want to go.

When presenting offers to your customers, you should always show the full name of the operating carrier of each segment
(`slices[].segments[].operating_carrier.name`). This must be displayed prominently on the first screen
where the offer is presented in order to comply with [US regulations](https://www.ecfr.gov/cgi-bin/text-idx?SID=8e736a5c813a737a5c2f6700a4c9006d&mc=true&node=pt14.4.257&rgn=div5).

### Query parameters

**return\_offers**

booleanlink icon

When set to `true`, the offer request resource returned will include _all_ the `offer`s returned by the airlines.
If set to `false`, the offer request resource won't include any `offer`s. To retrieve the associated offers later, use the [List Offers](https://duffel.com/docs/api/offers/get-offers) endpoint, specifying the `offer_request_id`. You should use this option if you want to take advantage of the pagination, sorting and filtering that the [List Offers](https://duffel.com/docs/api/offers/get-offers) endpoint provides.

Example:`false`

Default value:`true`

**supplier\_timeout**

integerlink icon

The maximum amount of time in milliseconds to wait for each airline search to complete. This timeout applies to the [response time](https://duffel.com/docs/api/overview/response-times) of the call to the airline and includes some additional overhead added by Duffel.
Value should be between 2 seconds and 60 seconds. Any values outside the range will be ignored and the default `supplier_timeout` will be used.
If a value is set, the response will only include offers from airline searches that completed within the given time.
If a value is not set, the response will only include offers from airline searches that completed within the default `supplier_timeout` value of 20 seconds.
We recommend setting `supplier_timeout` lower than the timeout on the HTTP request you send to Duffel API as that will allow us to respond with the offers we received before your request times out with an empty response.

Example:`10000`

Default value:`20000`

**view**

enumlink icon

The format of the response. When set to `offers` (the default), the response includes a flat list of offers.
When set to `itineraries`, offers are grouped into a hierarchical structure of slices, itineraries, and brands,
with shared data (airlines, places, aircraft) in top-level reference maps.

Possible values:`"offers"` or `"itineraries"`

Default value:`"offers"`

### Body parameters

Expand allunfold\_more icon

**airline\_credit\_ids**

string\[\]link icon

The list of airline credit IDs that Duffel received as input.

Example:`["acd_0000thhsUZ8W4LxQgkjo00"]`

**cabin\_class**

enumnullablelink icon

The cabin that the passengers want to travel in

Possible values:`"first"`, `"business"`, `"premium_economy"`, or `"economy"`

**include\_split\_ticket**

booleanlink icon

When set to `true` and the search has more than one slice, additional one-way searches will be fired per slice to find split-ticket candidates. These results are only included in the response when `view` is set to `itineraries`. Please get in touch with the Duffel support team at [help@duffel.com](mailto:help@duffel.com) to access this feature.

Example:`true`

**max\_connections**

integerlink icon

The maximum number of connections within any slice of the offer. For example 0 means a direct flight which will have a single segment within each slice and 1 means a maximum of two segments within each slice of the offer.

Example:`0`

Default value:`1`

**passengers**

listrequiredlink icon

The passengers who want to travel. If you specify an `age` for a passenger, the `type` may differ for the same passenger in different offers due to airline's different rules. e.g. one airline may treat a 14 year old as an adult, and another as a young adult. You may only specify an `age` or a `type` – not both.

**private\_fares**

link icon

The private fare codes for this offer request. You can pass in multiple airlines with their specific private fare codes. The key is the airline's IATA code that provided the private fare code. The `corporate_code` and `tour_code` are provided to you by the airline and the `tracking_reference` is to identify your business by the airlines.

Example:`{"QF":[{"corporate_code":"FLX53","tracking_reference":"ABN:2345678"}],"UA":[{"corporate_code":"1234","tour_code":"578DFL"}]}`

**slices**

listrequiredlink icon

The [slices](https://duffel.com/docs/api/overview/key-concepts) that make up this offer request. One-way journeys can be expressed using one slice, whereas return trips will need two.

Endpoint

copy

```bash
POST https://api.duffel.com/air/offer_requests
```

Request

curlNode.JS

copy

```bash

curl -X POST --compressed "https://api.duffel.com/air/offer_requests?return_offers=false&supplier_timeout=10000&view=undefined" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Content-Type: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \

  -d '{

  "data": {

    "slices": [\
\
      {\
\
        "origin": "LHR",\
\
        "destination": "JFK",\
\
        "departure_time": {\
\
          "to": "17:00",\
\
          "from": "09:45"\
\
        },\
\
        "departure_date": "2020-04-24",\
\
        "arrival_time": {\
\
          "to": "17:00",\
\
          "from": "09:45"\
\
        }\
\
      }\
\
    ],

    "private_fares": {

      "QF": [\
\
        {\
\
          "corporate_code": "FLX53",\
\
          "tracking_reference": "ABN:2345678"\
\
        }\
\
      ],

      "UA": [\
\
        {\
\
          "corporate_code": "1234",\
\
          "tour_code": "578DFL"\
\
        }\
\
      ]

    },

    "passengers": [\
\
      {\
\
        "family_name": "Earhart",\
\
        "given_name": "Amelia",\
\
        "loyalty_programme_accounts": [\
\
          {\
\
            "account_number": "12901014",\
\
            "airline_iata_code": "BA"\
\
          }\
\
        ],\
\
        "type": "adult"\
\
      },\
\
      {\
\
        "age": 14\
\
      },\
\
      {\
\
        "fare_type": "student"\
\
      },\
\
      {\
\
        "age": 5,\
\
        "fare_type": "contract_bulk_child"\
\
      }\
\
    ],

    "max_connections": 0,

    "include_split_ticket": true,

    "cabin_class": "economy",

    "airline_credit_ids": [\
\
      "acd_00009hthhsUZ8W4LxQgkjo",\
\
      "acd_0000thhsUZ8W4LxQgkjo00"\
\
    ]

  }

}'
```

...

View full sample

Response

copy

## Get a single offer request

Retrieves an offer request by its ID

### URL parameters

**id**

stringrequiredlink icon

Duffel's unique identifier for the offer request

Example:`"orq_00009hjdomFOCJyxHG7k7k"`

### Query parameters

**view**

enumlink icon

The format of the response. When set to `offers` (the default), the response includes a flat list of offers.
When set to `itineraries`, offers are grouped into a hierarchical structure of slices, itineraries, and brands,
with shared data (airlines, places, aircraft) in top-level reference maps.

Possible values:`"offers"` or `"itineraries"`

Default value:`"offers"`

Endpoint

copy

```bash
GET https://api.duffel.com/air/offer_requests/{id}
```

Request

curlNode.JS

copy

```bash

curl -X GET --compressed "https://api.duffel.com/air/offer_requests/{id}?view=undefined" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Response

copy

We use cookies to improve your experience and for marketing. [See our cookie policy.](https://duffel.com/cookies-policy)

Allow allReject allManage cookies