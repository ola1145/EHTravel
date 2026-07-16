---
url: "https://duffel.com/docs/api/v2/search"
title: "Search | Duffel Documentation"
---

* * *

# Search

A search is a set of search results from a given criteria. These search results can be found in its results property.

## Schema

Expand allunfold\_more icon

**created\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime on which the search was requested

Example:`"2022-12-20T15:21:01Z"`

**results**

listlink icon

A list of Search Results

## Search for accommodation

Returns all available accommodations that match your search criteria. You can search either by location or accommodation, but not both.

Each accommodation is returned with information on the cheapest available rate.

The room and rate information is not guaranteed to be complete or accurate on this endpoint and can vary across different accommodations. `cheapest_rate_total_amount` will always be accurate.

### Body parameters

Expand allunfold\_more icon

**accommodation**

objectnullablelink icon

The accommodation to search for. You must use either this object or the `location` object in your request

**check\_in\_date**

daterequiredlink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date on which the guest wants to check in. Check-in date can be no more than 330 days in the future.

Example:`"2023-06-04"`

**check\_out\_date**

daterequiredlink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date on which the guest wants to check out. A stay can be up to 99 nights.

Example:`"2023-06-07"`

**free\_cancellation\_only**

booleanlink icon

Whether this search is only for rates with free cancellation available. This can affect the rates and accommodation which are returned. If this is false, or omitted, all rates will be searched for.

Example:`false`

**guests**

listrequiredlink icon

The list of guests travelling.

**instant\_payment**

booleanpreviewlink icon

When `true`, only accommodation and rates are returned where payment is collected at the time of booking by Duffel or the source. When `false`, only rates where payment is collected by the accommodation are returned. When omitted, all rates are returned.

Example:`false`

**location**

objectnullablelink icon

Descriptor for an area to search for a stay. Accepts latitude-longitude paired with radius. You must use either this object or the `accommodation` object in your request

**mobile**

booleanlink icon

Whether this search has come from a mobile device. This can affect rates and content returned for this search.

Example:`false`

**negotiated\_rate\_ids**

string\[\]previewlink icon

A list of [negotiated rate ids](https://duffel.com/docs/api/v2/negotiated-rates#negotiated-rates-schema-id) to perform the search with.
Will return negotiated alongside public rates on a best effort basis for matching [accommodation ids](https://duffel.com/docs/api/v2/negotiated-rates#negotiated-rates-schema-accommodation-ids) on the negotiated rate.

Example:`["nre_0000ATOwpuYnZohiSmlmym"]`

**rooms**

integerrequiredlink icon

The number of rooms required

Example:`1`

Endpoint

copy

```bash
POST https://api.duffel.com/stays/search
```

Request

curlNode.JS

copy

```bash

curl -X POST --compressed "https://api.duffel.com/stays/search" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Content-Type: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \

  -d '{

  "data": {

    "rooms": 1,

    "negotiated_rate_ids": [\
\
      "nre_0000ATOwpuYnZohiSmlmym"\
\
    ],

    "mobile": false,

    "location": {

      "radius": 5,

      "geographic_coordinates": {

        "longitude": -0.1416,

        "latitude": 51.5071

      }

    },

    "instant_payment": false,

    "guests": [\
\
      {\
\
        "type": "adult"\
\
      },\
\
      {\
\
        "age": 7,\
\
        "type": "child"\
\
      }\
\
    ],

    "free_cancellation_only": false,

    "check_out_date": "2023-06-07",

    "check_in_date": "2023-06-04",

    "accommodation": {

      "fetch_rates": false

    }

  }

}'
```

...

View full sample

Response

copy

```json
{
  "data": {
    "results": [\
      {\
        "supported_negotiated_rates": [\
          {\
            "id": "nre_0000AvtkNoC81yBytDM9PE",\
            "display_name": "2025 Negotiated Rate"\
          }\
        ],\
        "rooms": 1,\
        "id": "srr_0000ASVBuJVLdmqtZDJ4ca",\
        "guests": [\
          {\
            "type": "adult",\
            "age": 7\
          }\
        ],\
        "expires_at": "2023-05-28T12:00:00Z",\
        "check_out_date": "2023-05-28",\
        "check_in_date": "2023-05-24",\
        "cheapest_rate_total_amount": "799.00",\
        "cheapest_rate_public_currency": "GBP",\
        "cheapest_rate_public_amount": "899.00",\
        "cheapest_rate_due_at_accommodation_currency": "GBP",\
        "cheapest_rate_due_at_accommodation_amount": "699.00",\
        "cheapest_rate_currency": "GBP",\
        "cheapest_rate_base_currency": "GBP",\
        "cheapest_rate_base_amount": "699.00",\
        "accommodation": {\
          "supported_loyalty_programme": "duffel_hotel_group_rewards",\
          "rooms": [\
            {\
              "rates": [\
                {\
                  "total_currency": "GBP",\
                  "total_amount": "799.00",\
                  "tax_currency": "GBP",\
                  "tax_amount": "82.23",\
                  "supported_loyalty_programme": "duffel_hotel_group_rewards",\
                  "quantity_available": 12,\
                  "public_currency": "GBP",\
                  "public_amount": "699.99",\
                  "payment_type": "pay_now",\
                  "negotiated_rate_id": "nre_0000ATOwpuYnZohiSmlmyz",\
                  "name": "Best Available Rate",\
                  "loyalty_programme_required": false,\
                  "id": "rat_0000BTVRuKZTavzrZDJ4cb",\
                  "fee_currency": "GBP",\
                  "fee_amount": "50.94",\
                  "expires_at": "2023-05-28T12:00:00Z",\
                  "estimated_commission_currency": "GBP",\
                  "estimated_commission_amount": "100.00",\
                  "due_at_accommodation_currency": "GBP",\
                  "due_at_accommodation_amount": "39.95",\
                  "description": "Complimentary Breakfast 2Ppl, 100Usd Htl Crdt Person Stay Or Lcl Curr Equiv Or 100 Fb Crdt, Nxt Cat Upgrd Subj To Available.",\
                  "deal_types": [\
                    "closed_user_group",\
                    "corporate",\
                    "mobile"\
                  ],\
                  "conditions": [\
                    {\
                      "title": "Parking",\
                      "description": "Public parking is available nearby for £15 per day"\
                    }\
                  ],\
                  "code": "ABC",\
                  "cancellation_timeline": [\
                    {\
                      "refund_amount": "799.00",\
                      "currency": "GBP",\
                      "before": "2023-05-23T13:00:00Z"\
                    }\
                  ],\
                  "board_type": "room_only",\
                  "benefits": [\
                    {\
                      "type": "breakfast_included",\
                      "title": "Daily breakfast",\
                      "description": "Daily full breakfast for up to two guests, served in the restaurant."\
                    }\
                  ],\
                  "base_currency": "GBP",\
                  "base_amount": "665.83",\
                  "available_payment_methods": [\
                    [\
                      "balance"\
                    ]\
                  ]\
                }\
              ],\
              "photos": [\
                {\
                  "url": "https://assets.duffel.com/img/stays/image.jpg"\
                }\
              ],\
              "name": "Double Suite",\
              "beds": [\
                {\
                  "type": "king",\
                  "count": 2\
                }\
              ]\
            }\
          ],\
          "review_score": 8.8,\
          "review_count": 336,\
          "rating": 3,\
          "photos": [\
            {\
              "url": "https://assets.duffel.com/img/stays/image.jpg"\
            }\
          ],\
          "phone_number": "+442074938181",\
          "payment_instruction_supported": false,\
          "name": "Duffel Test Hotel",\
          "location": {\
            "geographic_coordinates": {\
              "longitude": -0.1416,\
              "latitude": 51.5071\
            },\
            "address": {\
              "region": "England",\
              "postal_code": "EC2A 4TP",\
              "line_one": "100 Clifton Street",\
              "country_code": "GB",\
              "city_name": "London"\
            }\
          },\
          "key_collection": {\
            "instructions": "Please collect the keys from accommodation's reception."\
          },\
          "id": "acc_0000AWr2VsUNIF1Vl91xg0",\
          "email": "reservations@duffel-hotel-group.com",\
          "description": "Ornate quarters, some with grand pianos, in a luxurious hotel offering acclaimed dining & a spa.",\
          "check_in_information": {\
            "check_out_before_time": "11:30",\
            "check_in_before_time": "00:00",\
            "check_in_after_time": "14:30"\
          },\
          "chain": {\
            "name": "Accor Hotels",\
            "id": "chn_0000Alr8BYNsbmDMThHSbI"\
          },\
          "brand": {\
            "name": "Duffel Test",\
            "id": "bra_0000Alr8BYNsbmDMThHSbI"\
          },\
          "amenities": [\
            {\
              "type": "parking",\
              "description": "Parking"\
            }\
          ]\
        }\
      }\
    ],
    "created_at": "2022-12-20T15:21:01Z"
  }
}
```

...

View full sample