---
url: "https://duffel.com/docs/api/v2/offers"
title: "Offers | Duffel Documentation"
---

* * *

# Offers

After you've searched for flights by creating an offer request, we'll send your search to a
range of airlines, which may return offers.

Each offer represents flights you can buy from an airline at a particular price that
meet your search criteria.

You'll see slices inside the offers. Each slice will also include a list of one or
more specific flights (called segments) that the airline is offering to get the passengers where
they want to go.

An offer is only available to create an order for a limited time by the traveller before it expires, typically within 30 minutes.
Exact time is indicated by the `expires_at` field.

## Schema

Expand allunfold\_more icon

**available\_airline\_credit\_ids**

string\[\]link icon

The IDs of airline credits that can be used to pay for this offer. Each ID represents a credit that can be applied as a payment method when creating an order from this offer.

Example:`["acd_00009htYpSCXrwaB9DnUm1","acd_00009htYpSCXrwaB9DnUm2"]`

**available\_services**

listlink icon

The services that can be booked along with the offer but are not included by default, for example an additional checked bag. This field is only returned in the [Get single offer](https://duffel.com/docs/api/offers/get-offer-by-id) endpoint. When there are no services available, or we don't support services for the airline, this list will be empty. If you want to know which airlines we support services for, please get in touch with the Duffel support team at [help@duffel.com](mailto:help@duffel.com).

**base\_amount**

stringlink icon

The base price of the offer for all passengers, excluding taxes. It does not include the base amount of any service(s) that might be booked with the offer.

Example:`"30.20"`

**base\_currency**

stringlink icon

The currency of the `base_amount`, as an [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code.
It will match your organisation's billing currency unless you’re using Duffel as an accredited IATA agent, in which case it will be in the currency provided by the airline (which will usually be based on the country where your IATA agency is registered).

Example:`"GBP"`

**conditions**

objectlink icon

The conditions associated with this offer, describing the kinds of modifications you can make post-booking and any penalties that will apply to those modifications.
This information assumes the condition is applied to all of the slices and passengers associated with this offer - for information at the slice level (e.g. "what happens if I just want to change the first slice?") refer to the `slices`.
If a particular kind of modification is allowed, you may not always be able to take action through the Duffel API. In some cases, you may need to contact the Duffel support team or the airline directly.

**created\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime at which the offer was created

Example:`"2020-01-17T10:12:14.545Z"`

**expires\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime expiry of the offer before which the traveller should use this offer to create an order. After this time the offer can no longer be used to create an order.

Example:`"2020-01-17T10:42:14.545Z"`

**id**

stringlink icon

Duffel's unique identifier for the resource

Example:`"off_00009htYpSCXrwaB9DnUm0"`

**intended\_payment\_methods**

listlink icon

The payment methods that will be used to pay for the offer and their fees if any.

**intended\_services**

listlink icon

The services that will be booked with the offer.

**live\_mode**

booleanlink icon

Whether the offer request was created in live mode. This field will be set to `true` if the offer request was created in live mode, or `false` if it was created in test mode.

Example:`true`

**owner**

objectlink icon

The airline which provided the offer

**partial**

booleanlink icon

Partial offers are a new concept we're introducing as a part of a new multi-step search flow that we're currently experimenting with.
A partial offer can't be booked directly, but it can be combined with other partial offers to form a full offer.
Partial offers are only ever returned through the multi-step search flow. So there's no need to add any handling to deal with partial offers if you're using the traditional `OfferRequest` search flow to create offers.

Example:`true`

**passenger\_identity\_documents\_required**

booleanlink icon

Whether identity documents must be provided for each of the passengers when creating an order based on this offer. If this is `true`, you must provide a passport document for every passenger.

Example:`false`

**passengers**

listlink icon

The passengers included in the offer

**payment\_requirements**

objectlink icon

The payment requirements for this offer

**private\_fares**

listlink icon

The private fares applied on this offer.

**slices**

listlink icon

The [slices](https://duffel.com/docs/api/overview/key-concepts) that make up this offer. Each slice will include one or more [segments](https://duffel.com/docs/api/overview/key-concepts), the specific flights that the airline is offering to take the passengers from the slice's `origin` to its `destination`.
[Partial](https://duffel.com/docs/api/v2/offers#offers-schema-partial) offers contain a single slice as each partial offer is for a particular slice of the journey.

**supported\_loyalty\_programmes**

string\[\]link icon

A list of airline IATA codes whose loyalty programmes are supported when booking the offer.
Loyalty programmes present within the offer passengers that are not present in this field shall be ignored at booking.
If this is an empty list (`[]`), no loyalty programmes are supported for the offer and shall be ignored if provided.

Example:`["AF","KL","DL"]`

**supported\_passenger\_identity\_document\_types**

string\[\]link icon

The types of identity documents supported by the airline and may be provided for the passengers when creating an order based on this offer.
Currently, possible types are `passport`, `tax_id`, `known_traveler_number`, and `passenger_redress_number`.

Example:`["passport"]`

**tax\_amount**

stringnullablelink icon

The amount of tax payable on the offer for all passengers

Example:`"40.80"`

**tax\_currency**

stringnullablelink icon

The currency of the `tax_amount`, as an [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code.
It will match your organisation's billing currency unless you’re using Duffel as an accredited IATA agent, in which case it will be in the currency provided by the airline (which will usually be based on the country where your IATA agency is registered).

Example:`"GBP"`

**total\_amount**

stringlink icon

The total price of the offer for all passengers, including taxes. It does not include the total price of any service(s) that might be booked with the offer.

Example:`"45.00"`

**total\_currency**

stringlink icon

The currency of the `total_amount`, as an [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code.
It will match your organisation's billing currency unless you’re using Duffel as an accredited IATA agent, in which case it will be in the currency provided by the airline (which will usually be based on the country where your IATA agency is registered).

Example:`"GBP"`

**total\_emissions\_kg**

stringnullablelink icon

An estimate of the total carbon dioxide (CO₂) emissions when all of the passengers fly this offer's itinerary, measured in kilograms

Example:`"460"`

**updated\_at**

datetimelink icon

The [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime at which the offer was last updated

Example:`"2020-01-17T10:12:14.545Z"`

## Get a single offer

You should use this API to get the complete, up-to-date information about an offer.
This endpoint **does not** guarantee that the offer will be available at the time of booking.

Due to limitations in airlines' systems, you may see changes to the offer (e.g a changed `total_amount`).
Additionally, you may receive information that may have not been included in the original offer such as baggage allowances.

Optionally, you can request information about additional `available_services` that you can book
with this offer by specifying the `return_available_services` query parameter. Each time you make this API call there's
a possibility that some of the service information will have changed, so you should always use data (e.g prices, service IDs)
from the latest call to this endpoint when booking an offer.

It is recommended that you make use of this endpoint when you are ready to book an offer as search prices returned by airlines
are not guaranteed to be available at the time of booking. Use this endpoint when the traveller is considering booking an offer
or after updating the passenger information on an offer.

### URL parameters

**id**

stringrequiredlink icon

Duffel's unique identifier for the resource

Example:`"xxx_00009hthhsUZ8W4LxQgkjo"`

### Query parameters

**return\_available\_services**

booleanlink icon

When set to `true`, the offer resource returned will include all the `available_services` returned by the airline.
If set to false, the offer resource won't include any `available_services`.

Example:`true`

Default value:`false`

Endpoint

copy

```bash
GET https://api.duffel.com/air/offers/{id}
```

Request

curlNode.JS

copy

```bash

curl -X GET --compressed "https://api.duffel.com/air/offers/{id}?return_available_services=true" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Response

copy

```json
{
  "data": {
    "updated_at": "2020-01-17T10:12:14.545Z",
    "total_emissions_kg": "460",
    "total_currency": "GBP",
    "total_amount": "45.00",
    "tax_currency": "GBP",
    "tax_amount": "40.80",
    "supported_passenger_identity_document_types": [\
      "passport"\
    ],
    "supported_loyalty_programmes": [\
      "AF",\
      "KL",\
      "DL"\
    ],
    "slices": [\
      {\
        "segments": [\
          {\
            "stops": [\
              {\
                "id": "sto_00009htYpSCXrwaB9Dn456",\
                "duration": "PT02H26M",\
                "departing_at": "2020-06-13T16:38:02",\
                "arriving_at": "2020-06-13T16:38:02",\
                "airport": {\
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
                }\
              }\
            ],\
            "passengers": [\
              {\
                "passenger_id": "passenger_0",\
                "fare_basis_code": "OXZ0RO",\
                "cabin_class_marketing_name": "Economy Basic",\
                "cabin_class": "economy",\
                "cabin": {\
                  "name": "economy",\
                  "marketing_name": "Economy Basic",\
                  "amenities": {\
                    "wifi": {\
                      "cost": "free",\
                      "available": "true"\
                    },\
                    "seat": {\
                      "type": "standard",\
                      "pitch": "32",\
                      "legroom": "standard"\
                    },\
                    "power": {\
                      "available": "true"\
                    }\
                  }\
                },\
                "baggages": [\
                  {\
                    "type": "checked",\
                    "quantity": 1\
                  }\
                ]\
              }\
            ],\
            "origin_terminal": "B",\
            "origin": {\
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
            },\
            "operating_carrier_flight_number": "4321",\
            "operating_carrier": {\
              "name": "British Airways",\
              "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
              "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
              "id": "arl_00001876aqC8c5umZmrRds",\
              "iata_code": "BA",\
              "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
            },\
            "marketing_carrier_flight_number": "1234",\
            "marketing_carrier": {\
              "name": "British Airways",\
              "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
              "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
              "id": "arl_00001876aqC8c5umZmrRds",\
              "iata_code": "BA",\
              "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
            },\
            "id": "seg_00009htYpSCXrwaB9Dn456",\
            "duration": "PT02H26M",\
            "distance": "424.2",\
            "destination_terminal": "5",\
            "destination": {\
              "time_zone": "America/New_York",\
              "name": "John F. Kennedy International Airport",\
              "longitude": -73.778519,\
              "latitude": 40.640556,\
              "id": "arp_jfk_us",\
              "icao_code": "KJFK",\
              "iata_country_code": "US",\
              "iata_code": "JFK",\
              "iata_city_code": "NYC",\
              "city_name": "New York",\
              "city": {\
                "name": "New York",\
                "id": "cit_nyc_us",\
                "iata_country_code": "US",\
                "iata_code": "NYC"\
              }\
            },\
            "departing_at": "2020-06-13T16:38:02",\
            "arriving_at": "2020-06-13T16:38:02",\
            "aircraft": {\
              "name": "Airbus Industries A380",\
              "id": "arc_00009UhD4ongolulWd91Ky",\
              "iata_code": "380"\
            }\
          }\
        ],\
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
        "ngs_shelf": 1,\
        "id": "sli_00009htYpSCXrwaB9Dn123",\
        "fare_brand_name": "Basic",\
        "duration": "PT02H26M",\
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
        "conditions": {\
          "priority_check_in": "true",\
          "priority_boarding": "true",\
          "change_before_departure": {\
            "penalty_currency": "GBP",\
            "penalty_amount": "100.00",\
            "allowed": true\
          },\
          "advance_seat_selection": "true"\
        },\
        "comparison_key": "BmlZDw=="\
      }\
    ],
    "private_fares": [\
      {\
        "type": "corporate",\
        "tracking_reference": "ABN:2345678",\
        "tour_code": "578DFL",\
        "corporate_code": "FLX53"\
      }\
    ],
    "payment_requirements": {
      "requires_instant_payment": false,
      "price_guarantee_expires_at": "2020-01-17T10:42:14Z",
      "payment_required_by": "2020-01-17T10:42:14Z"
    },
    "passengers": [\
      {\
        "type": "adult",\
        "loyalty_programme_accounts": [\
          {\
            "airline_iata_code": "BA",\
            "account_number": "12901014"\
          }\
        ],\
        "id": "pas_00009hj8USM7Ncg31cBCL",\
        "given_name": "Amelia",\
        "fare_type": "contract_bulk",\
        "family_name": "Earhart",\
        "age": 14\
      }\
    ],
    "passenger_identity_documents_required": false,
    "partial": true,
    "owner": {
      "name": "British Airways",
      "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",
      "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",
      "id": "arl_00001876aqC8c5umZmrRds",
      "iata_code": "BA",
      "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"
    },
    "live_mode": true,
    "intended_services": [\
      {\
        "quantity": 1,\
        "id": "ase_00009UhD4ongolulWd9123"\
      }\
    ],
    "id": "off_00009htYpSCXrwaB9DnUm0",
    "expires_at": "2020-01-17T10:42:14.545Z",
    "created_at": "2020-01-17T10:12:14.545Z",
    "conditions": {
      "refund_before_departure": {
        "penalty_currency": "GBP",
        "penalty_amount": "100.00",
        "allowed": true
      },
      "change_before_departure": {
        "penalty_currency": "GBP",
        "penalty_amount": "100.00",
        "allowed": true
      }
    },
    "base_currency": "GBP",
    "base_amount": "30.20",
    "available_services": [\
      {\
        "type": "baggage",\
        "total_currency": "GBP",\
        "total_amount": "15.00",\
        "segment_ids": [\
          "seg_00009hj8USM7Ncg31cB456"\
        ],\
        "passenger_ids": [\
          "pas_00009hj8USM7Ncg31cBCLL"\
        ],\
        "maximum_quantity": 1,\
        "id": "ase_00009UhD4ongolulWd9123"\
      }\
    ],
    "available_airline_credit_ids": [\
      "acd_00009htYpSCXrwaB9DnUm1",\
      "acd_00009htYpSCXrwaB9DnUm2"\
    ]
  }
}
```

...

View full sample

## Price an offer with intended payment methods

Price the offer with intended payment methods and intended services.
This will return the total amount that will be charged to the customer, including any applicable surcharges.

### URL parameters

**id**

stringrequiredlink icon

Duffel's unique identifier for the resource

Example:`"xxx_00009hthhsUZ8W4LxQgkjo"`

### Body parameters

Expand allunfold\_more icon

**intended\_payment\_methods**

listrequiredlink icon

The payment methods you intend to use to pay for the offer.

**intended\_services**

listrequiredlink icon

The services you intend to book along with the offer.

Endpoint

copy

```bash
POST https://api.duffel.com/air/offers/{id}/actions/price
```

Request

curlNode.JS

copy

```bash

curl -X POST --compressed "https://api.duffel.com/air/offers/{id}/actions/price" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \

  -d '{

  "data": {

    "intended_services": [\
\
      {\
\
        "quantity": 1,\
\
        "id": "ase_00009UhD4ongolulWd9123"\
\
      }\
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
    "updated_at": "2020-01-17T10:12:14.545Z",
    "total_emissions_kg": "460",
    "total_currency": "GBP",
    "total_amount": "45.00",
    "tax_currency": "GBP",
    "tax_amount": "40.80",
    "supported_passenger_identity_document_types": [\
      "passport"\
    ],
    "supported_loyalty_programmes": [\
      "AF",\
      "KL",\
      "DL"\
    ],
    "slices": [\
      {\
        "segments": [\
          {\
            "stops": [\
              {\
                "id": "sto_00009htYpSCXrwaB9Dn456",\
                "duration": "PT02H26M",\
                "departing_at": "2020-06-13T16:38:02",\
                "arriving_at": "2020-06-13T16:38:02",\
                "airport": {\
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
                }\
              }\
            ],\
            "passengers": [\
              {\
                "passenger_id": "passenger_0",\
                "fare_basis_code": "OXZ0RO",\
                "cabin_class_marketing_name": "Economy Basic",\
                "cabin_class": "economy",\
                "cabin": {\
                  "name": "economy",\
                  "marketing_name": "Economy Basic",\
                  "amenities": {\
                    "wifi": {\
                      "cost": "free",\
                      "available": "true"\
                    },\
                    "seat": {\
                      "type": "standard",\
                      "pitch": "32",\
                      "legroom": "standard"\
                    },\
                    "power": {\
                      "available": "true"\
                    }\
                  }\
                },\
                "baggages": [\
                  {\
                    "type": "checked",\
                    "quantity": 1\
                  }\
                ]\
              }\
            ],\
            "origin_terminal": "B",\
            "origin": {\
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
            },\
            "operating_carrier_flight_number": "4321",\
            "operating_carrier": {\
              "name": "British Airways",\
              "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
              "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
              "id": "arl_00001876aqC8c5umZmrRds",\
              "iata_code": "BA",\
              "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
            },\
            "marketing_carrier_flight_number": "1234",\
            "marketing_carrier": {\
              "name": "British Airways",\
              "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
              "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
              "id": "arl_00001876aqC8c5umZmrRds",\
              "iata_code": "BA",\
              "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
            },\
            "id": "seg_00009htYpSCXrwaB9Dn456",\
            "duration": "PT02H26M",\
            "distance": "424.2",\
            "destination_terminal": "5",\
            "destination": {\
              "time_zone": "America/New_York",\
              "name": "John F. Kennedy International Airport",\
              "longitude": -73.778519,\
              "latitude": 40.640556,\
              "id": "arp_jfk_us",\
              "icao_code": "KJFK",\
              "iata_country_code": "US",\
              "iata_code": "JFK",\
              "iata_city_code": "NYC",\
              "city_name": "New York",\
              "city": {\
                "name": "New York",\
                "id": "cit_nyc_us",\
                "iata_country_code": "US",\
                "iata_code": "NYC"\
              }\
            },\
            "departing_at": "2020-06-13T16:38:02",\
            "arriving_at": "2020-06-13T16:38:02",\
            "aircraft": {\
              "name": "Airbus Industries A380",\
              "id": "arc_00009UhD4ongolulWd91Ky",\
              "iata_code": "380"\
            }\
          }\
        ],\
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
        "ngs_shelf": 1,\
        "id": "sli_00009htYpSCXrwaB9Dn123",\
        "fare_brand_name": "Basic",\
        "duration": "PT02H26M",\
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
        "conditions": {\
          "priority_check_in": "true",\
          "priority_boarding": "true",\
          "change_before_departure": {\
            "penalty_currency": "GBP",\
            "penalty_amount": "100.00",\
            "allowed": true\
          },\
          "advance_seat_selection": "true"\
        },\
        "comparison_key": "BmlZDw=="\
      }\
    ],
    "private_fares": [\
      {\
        "type": "corporate",\
        "tracking_reference": "ABN:2345678",\
        "tour_code": "578DFL",\
        "corporate_code": "FLX53"\
      }\
    ],
    "payment_requirements": {
      "requires_instant_payment": false,
      "price_guarantee_expires_at": "2020-01-17T10:42:14Z",
      "payment_required_by": "2020-01-17T10:42:14Z"
    },
    "passengers": [\
      {\
        "type": "adult",\
        "loyalty_programme_accounts": [\
          {\
            "airline_iata_code": "BA",\
            "account_number": "12901014"\
          }\
        ],\
        "id": "pas_00009hj8USM7Ncg31cBCL",\
        "given_name": "Amelia",\
        "fare_type": "contract_bulk",\
        "family_name": "Earhart",\
        "age": 14\
      }\
    ],
    "passenger_identity_documents_required": false,
    "partial": true,
    "owner": {
      "name": "British Airways",
      "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",
      "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",
      "id": "arl_00001876aqC8c5umZmrRds",
      "iata_code": "BA",
      "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"
    },
    "live_mode": true,
    "intended_services": [\
      {\
        "quantity": 1,\
        "id": "ase_00009UhD4ongolulWd9123"\
      }\
    ],
    "id": "off_00009htYpSCXrwaB9DnUm0",
    "expires_at": "2020-01-17T10:42:14.545Z",
    "created_at": "2020-01-17T10:12:14.545Z",
    "conditions": {
      "refund_before_departure": {
        "penalty_currency": "GBP",
        "penalty_amount": "100.00",
        "allowed": true
      },
      "change_before_departure": {
        "penalty_currency": "GBP",
        "penalty_amount": "100.00",
        "allowed": true
      }
    },
    "base_currency": "GBP",
    "base_amount": "30.20",
    "available_services": [\
      {\
        "type": "baggage",\
        "total_currency": "GBP",\
        "total_amount": "15.00",\
        "segment_ids": [\
          "seg_00009hj8USM7Ncg31cB456"\
        ],\
        "passenger_ids": [\
          "pas_00009hj8USM7Ncg31cBCLL"\
        ],\
        "maximum_quantity": 1,\
        "id": "ase_00009UhD4ongolulWd9123"\
      }\
    ],
    "available_airline_credit_ids": [\
      "acd_00009htYpSCXrwaB9DnUm1",\
      "acd_00009htYpSCXrwaB9DnUm2"\
    ]
  }
}
```

...

View full sample

## Update a single offer passenger

The loyalty programme accounts of a passenger can be updated by providing their full
name and account details in the request.

After updating a passenger, you should re-fetch the offer to get the latest information
as the price might have changed.

### URL parameters

**offer\_id**

stringrequiredlink icon

Duffel's unique identifier for the resource

Example:`"xxx_00009hthhsUZ8W4LxQgkjo"`

**offer\_passenger\_id**

stringrequiredlink icon

The identifier for the passenger. This ID will be generated by Duffel

Example:`"pas_00009hj8USM7Ncg31cBCL"`

### Body parameters

Expand allunfold\_more icon

**family\_name**

stringrequiredlink icon

The passenger's family name. Only `space`, `-`, `'`, and letters from the [`ASCII`](https://www.unicode.org/charts/PDF/U0000.pdf), [`Latin-1 Supplement`](https://www.unicode.org/charts/PDF/U0080.pdf) and [`Latin Extended-A`](https://www.unicode.org/charts/PDF/U0100.pdf) (with the exceptions of `Æ`, `æ`, `Ĳ`, `ĳ`, `Œ`, `œ`, `Þ`, and `ð`) Unicode charts are accepted. All other characters will result in a validation error. The minimum length is 1 character, and the maximum is 20 characters.

Example:`"Earhart"`

**given\_name**

stringrequiredlink icon

The passenger's given name. Only `space`, `-`, `'`, and letters from the [`ASCII`](https://www.unicode.org/charts/PDF/U0000.pdf), [`Latin-1 Supplement`](https://www.unicode.org/charts/PDF/U0080.pdf) and [`Latin Extended-A`](https://www.unicode.org/charts/PDF/U0100.pdf) (with the exceptions of `Æ`, `æ`, `Ĳ`, `ĳ`, `Œ`, `œ`, `Þ`, and `ð`) Unicode charts are accepted. All other characters will result in a validation error. The minimum length is 1 character, and the maximum is 20 characters.

Example:`"Amelia"`

**loyalty\_programme\_accounts**

listlink icon

The loyalty programme accounts for this passenger

Endpoint

copy

```bash
PATCH https://api.duffel.com/air/offers/{offer_id}/passengers/{offer_passenger_id}
```

Request

curlNode.JS

copy

```bash

curl -X PATCH --compressed "https://api.duffel.com/air/offers/{offer_id}/passengers/{offer_passenger_id}" \

  -H "Accept-Encoding: gzip" \

  -H "Accept: application/json" \

  -H "Duffel-Version: v2" \

  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \

  -d '{

  "data": {

    "loyalty_programme_accounts": [\
\
      {\
\
        "airline_iata_code": "BA",\
\
        "account_number": "12901014"\
\
      }\
\
    ],

    "given_name": "Amelia",

    "family_name": "Earhart"

  }

}'
```

Response

copy

```json
{
  "data": {
    "type": "adult",
    "loyalty_programme_accounts": [\
      {\
        "airline_iata_code": "BA",\
        "account_number": "12901014"\
      }\
    ],
    "id": "pas_00009hj8USM7Ncg31cBCL",
    "given_name": "Amelia",
    "fare_type": "contract_bulk",
    "family_name": "Earhart",
    "age": 14
  }
}
```

## List offers

Retrieves a list of offers for a given offer request specified by its ID. Unless you specify a `sort` parameter, the results may be returned in any order.

This endpoint does not return the complete, up-to-date information on each offer. The [Get a single offer](https://duffel.com/docs/api/offers/get-offer-by-id) endpoint should be called for a given offer in order to get complete and up-to-date information.

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

**offer\_request\_id**

stringrequiredlink icon

Duffel's unique identifier for the offer request, returned when it was created

Example:`"orq_00009htyDGjIfajdNBZRlw"`

**sort**

enumlink icon

By default, the offers will be returned sorted by ID in ascending order.
This parameter allows you to sort the list of offers by `total_amount` or `total_duration`.
By default the sorting order will be ascending, if you wish to sort in descending order a `-` will need to be
prepended to the sorting attribute (i.e: `-total_amount`).

Possible values:`"total_amount"` or `"total_duration"`

**max\_connections**

integerlink icon

Allows to filter the offers list by the maximum number of connections in a given offer.
e.g. a return flight with three flights outbound and a direct inbound flight would
be filtered out if `max_connections=1` was passed.

Example:`0`

Default value:`1`

Endpoint

copy

```bash
GET https://api.duffel.com/air/offers
```

Request

curlNode.JS

copy

```bash

curl -X GET --compressed "https://api.duffel.com/air/offers?after=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=&before=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=&limit=1&offer_request_id=orq_00009htyDGjIfajdNBZRlw&sort=total_amount&max_connections=0" \

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
      "total_emissions_kg": "460",\
      "total_currency": "GBP",\
      "total_amount": "45.00",\
      "tax_currency": "GBP",\
      "tax_amount": "40.80",\
      "supported_passenger_identity_document_types": [\
        "passport"\
      ],\
      "slices": [\
        {\
          "segments": [\
            {\
              "stops": [\
                {\
                  "id": "sto_00009htYpSCXrwaB9Dn456",\
                  "duration": "PT02H26M",\
                  "departing_at": "2020-06-13T16:38:02",\
                  "arriving_at": "2020-06-13T16:38:02",\
                  "airport": {\
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
                  }\
                }\
              ],\
              "passengers": [\
                {\
                  "passenger_id": "passenger_0",\
                  "fare_basis_code": "OXZ0RO",\
                  "cabin_class_marketing_name": "Economy Basic",\
                  "cabin_class": "economy",\
                  "cabin": {\
                    "name": "economy",\
                    "marketing_name": "Economy Basic",\
                    "amenities": {\
                      "wifi": {\
                        "cost": "free",\
                        "available": "true"\
                      },\
                      "seat": {\
                        "type": "standard",\
                        "pitch": "32",\
                        "legroom": "standard"\
                      },\
                      "power": {\
                        "available": "true"\
                      }\
                    }\
                  },\
                  "baggages": [\
                    {\
                      "type": "checked",\
                      "quantity": 1\
                    }\
                  ]\
                }\
              ],\
              "origin_terminal": "B",\
              "origin": {\
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
              },\
              "operating_carrier_flight_number": "4321",\
              "operating_carrier": {\
                "name": "British Airways",\
                "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
                "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
                "id": "arl_00001876aqC8c5umZmrRds",\
                "iata_code": "BA",\
                "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
              },\
              "marketing_carrier_flight_number": "1234",\
              "marketing_carrier": {\
                "name": "British Airways",\
                "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
                "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
                "id": "arl_00001876aqC8c5umZmrRds",\
                "iata_code": "BA",\
                "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
              },\
              "id": "seg_00009htYpSCXrwaB9Dn456",\
              "duration": "PT02H26M",\
              "distance": "424.2",\
              "destination_terminal": "5",\
              "destination": {\
                "time_zone": "America/New_York",\
                "name": "John F. Kennedy International Airport",\
                "longitude": -73.778519,\
                "latitude": 40.640556,\
                "id": "arp_jfk_us",\
                "icao_code": "KJFK",\
                "iata_country_code": "US",\
                "iata_code": "JFK",\
                "iata_city_code": "NYC",\
                "city_name": "New York",\
                "city": {\
                  "name": "New York",\
                  "id": "cit_nyc_us",\
                  "iata_country_code": "US",\
                  "iata_code": "NYC"\
                }\
              },\
              "departing_at": "2020-06-13T16:38:02",\
              "arriving_at": "2020-06-13T16:38:02",\
              "aircraft": {\
                "name": "Airbus Industries A380",\
                "id": "arc_00009UhD4ongolulWd91Ky",\
                "iata_code": "380"\
              }\
            }\
          ],\
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
          "ngs_shelf": 1,\
          "id": "sli_00009htYpSCXrwaB9Dn123",\
          "fare_brand_name": "Basic",\
          "duration": "PT02H26M",\
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
          "conditions": {\
            "priority_check_in": "true",\
            "priority_boarding": "true",\
            "change_before_departure": {\
              "penalty_currency": "GBP",\
              "penalty_amount": "100.00",\
              "allowed": true\
            },\
            "advance_seat_selection": "true"\
          },\
          "comparison_key": "BmlZDw=="\
        }\
      ],\
      "private_fares": [\
        {\
          "type": "corporate",\
          "tracking_reference": "ABN:2345678",\
          "tour_code": "578DFL",\
          "corporate_code": "FLX53"\
        }\
      ],\
      "payment_requirements": {\
        "requires_instant_payment": false,\
        "price_guarantee_expires_at": "2020-01-17T10:42:14Z",\
        "payment_required_by": "2020-01-17T10:42:14Z"\
      },\
      "passengers": [\
        {\
          "type": "adult",\
          "loyalty_programme_accounts": [\
            {\
              "airline_iata_code": "BA",\
              "account_number": "12901014"\
            }\
          ],\
          "id": "pas_00009hj8USM7Ncg31cBCL",\
          "given_name": "Amelia",\
          "fare_type": "contract_bulk",\
          "family_name": "Earhart",\
          "age": 14\
        }\
      ],\
      "passenger_identity_documents_required": false,\
      "partial": true,\
      "owner": {\
        "name": "British Airways",\
        "logo_symbol_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/BA.svg",\
        "logo_lockup_url": "https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/BA.svg",\
        "id": "arl_00001876aqC8c5umZmrRds",\
        "iata_code": "BA",\
        "conditions_of_carriage_url": "https://www.britishairways.com/en-gb/information/legal/british-airways/general-conditions-of-carriage"\
      },\
      "live_mode": true,\
      "id": "xxx_00009hthhsUZ8W4LxQgkjo",\
      "expires_at": "2020-01-17T10:42:14.545Z",\
      "created_at": "2020-01-17T10:12:14.545Z",\
      "conditions": {\
        "refund_before_departure": {\
          "penalty_currency": "GBP",\
          "penalty_amount": "100.00",\
          "allowed": true\
        },\
        "change_before_departure": {\
          "penalty_currency": "GBP",\
          "penalty_amount": "100.00",\
          "allowed": true\
        }\
      },\
      "base_currency": "GBP",\
      "base_amount": "30.20"\
    }\
  ]
}
```

...

View full sample

We use cookies to improve your experience and for marketing. [See our cookie policy.](https://duffel.com/cookies-policy)

Allow allReject allManage cookies