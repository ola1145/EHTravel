---
url: "https://duffel.com/docs/guides/getting-started-with-stays"
title: "Getting Started with Stays | Duffel Documentation"
---

* * *

# Getting Started with Stays

The Duffel Stays API provides a single API to search, book and manage accommodation bookings at millions of properties worldwide.

## Getting Started

This guide will walk you through how to integrate our search and book accommodation flow into your own product.

Before you can get started with this guide, you'll need to:

- [Sign up](https://app.duffel.com/join) for a Duffel account (it takes about 1 minute!)

- [Request access to Duffel Stays](https://duffel.com/contact-us)

- On the navigation header, click on "More", then navigate to "Developers"

- Create a test access token from the "Access tokens" page in your [Dashboard](https://app.duffel.com/)


Similar to our Flights API, refer to our [“Making requests”](https://duffel.com/docs/api/overview/making-requests) section to set up the appropriate headers to make requests.

To make it easy to build your integration, we updated our [JavaScript client library](https://duffel.com/docs/guides/javascript-client-library) to support Stays.

If you aren't using JavaScript, you can follow along with `curl` in your terminal, script the flow using your preferred programming language, or use the API via an HTTP client like [Postman](https://www.postman.com/).

Tip

We've put together a [Postman Collection](https://www.postman.com/duffelhq/workspace/duffel/collection/16830459-f952ceaa-fcd9-425e-90a8-78de803b541d?action=share&creator=16830459) that contains all of the requests you'll need to follow along with this guide.

## Overview

Put simply; there are four steps to search and book Accommodation with Duffel Stays:

- [Search for accommodation](https://duffel.com/docs/guides/getting-started-with-stays#1-search-for-an-accommodation)

- [Retrieve all available room rates for your chosen result](https://duffel.com/docs/guides/getting-started-with-stays#2-retrieve-all-available-room-rates-for-your-chosen-result)

- [Request a final quote for your selected rate](https://duffel.com/docs/guides/getting-started-with-stays#3-request-a-final-quote-for-your-selected-rate)

- [Create a booking](https://duffel.com/docs/guides/getting-started-with-stays#4-create-a-booking)


Each step returns an ID, or a set of IDs you can choose from to move to the next step.

## 1\. Search for an accommodation

Note

You can learn more about different search options in our [Searching for\\
Stays](https://duffel.com/docs/guides/searching-for-stays) guide.

There are four important things to provide when searching for available accommodation:

- Number of guests

- Number of rooms

- Check in and Check out dates

- Search Location (Latitude and Longitude, with a coverage radius in kilometres) or accommodation IDs to search for


[Our endpoint](https://duffel.com/docs/api/v2/search/stays-search) will return a list of search results, each with its own accommodation. Select the search result with the desired available accommodation. It is important to note that the `search_result_id` of this search result is required in the next step.

We will only return available accommodation that matches your search criteria. It’s expected that a search result’s accommodation may not include rooms and rates information provided at this stage in the flow, but you will always know the cheapest rate.

```
JavaScript
Node.JScurl
copy

duffel.stays.search({

  rooms: 1,

  location: {

    radius: 2,

    geographic_coordinates: {

      longitude: -0.1416,

      latitude: 51.5071

    }

  },

  check_out_date: "2023-12-07",

  check_in_date: "2023-12-04",

  guests: [{type: "adult"}, {type: "adult"}]

})
```

## 2\. Retrieve all available room rates for your chosen result

Using the `search_result_id` for the desired accommodation from the previous step, we can use the [fetch all rates endpoint](https://duffel.com/docs/api/v2/search-result/fetch-all-rates) to retrieve all available rooms and rates for that result.

An accommodation can have multiple room options, and rooms in turn can have various rates. The rate for a room varies in price depending on what’s included. For example, the same room can be purchased through a rate that comes with or without breakfast or is non-refundable or fully refundable.

We need to take note of the desired `rate_id` in order to move to the next step.

```
JavaScript
Node.JScurl
copy

duffel.stays.searchResults.fetchAllRates(SEARCH_RESULT_ID)
```

## 3\. Request a final quote for your selected rate

We can request a quote with the [quote creation endpoint](https://duffel.com/docs/api/v2/quotes/create-quote) by passing the `rate_id` from the previous step.

```
JavaScript
Node.JScurl
copy

duffel.stays.quotes.create(RATE_ID)
```

The quote step enables you to confirm that the rate is still available for purchase prior to charging your customer.

On rare occasions, rates become unavailable between the time a customer searches & they make a booking attempt. The reasons include, but are not limited to the following:

- All the rooms for the rate may have been booked for the given dates already

- There may have been a change in price for the rate you selected

- The hotel or the provider may have made it unavailable in their own discretion


Otherwise, the response includes a `quote_id`, which can be used to create a booking.

## 4\. Create a booking

To finalise the purchase of a quote, we create a booking using the `quote_id` from the previous step, along with the other required information indicated in the [API documentation](https://duffel.com/docs/api/v2/bookings/create-booking).

```
JavaScript
Node.JScurl
copy

duffel.stays.bookings.create({

  quote_id: QUOTE_ID,

  phone_number: "+442080160509",

  guests: [\
\
    {\
\
      given_name: "Amelia",\
\
      family_name: "Earhart",\
\
      born_on: "1987-07-24"\
\
    }\
\
  ],

  email: "amelia.earhart@duffel.com",

  accommodation_special_requests: "2:00 PM early check-in required"

})
```

When successful, the endpoint will return all the information you need to display a booking confirmation page.

To ensure your customer has all the necessary information about the travel services they’ve purchased, you must ensure the following information is displayed during checkout and booking confirmation:

![Example booking confirmation page](https://duffel.com/images/docs/stays/booking-confirmation-page.png)

Example booking confirmation page

Please note, to adhere with your customer’s local legislation, display of additional information may be required.

**Key collection** guidance is usually required when an accommodation does not have a front desk. If this applies, a successful booking will include the [key collection instructions](https://duffel.com/docs/api/v2/bookings/get-booking#bookings-schema-key-collection) as part of the booking. For example: `"Please collect the keys from accommodation's reception."` and `"A PIN code is required to access the accommodation."`

Some key collection methods will require access details to be shared ahead of
the check-in. You are responsible for forwarding this information to your customer. When they are shared by the accommodation, our travel support
team will ensure you are notified by the [support email address you have set in your team settings](https://app.duffel.com/settings/contact-emails).

If you'd like to get a complete look at data you can provide when creating an order and what you'll get back, check out our [API reference](https://duffel.com/docs/api/v2/bookings/create-booking).

## Learn more

All set! Amelia has now been booked for their stay.

The booking details can be retrieved any time by it's `id` using the [get booking](https://duffel.com/docs/api/v2/bookings/get-booking) endpoint.

[Getting Started](https://duffel.com/docs/guides/getting-started-with-stays#getting-started)

[Overview](https://duffel.com/docs/guides/getting-started-with-stays#overview)

[1\. Search for an accommodation](https://duffel.com/docs/guides/getting-started-with-stays#1-search-for-an-accommodation)

[2\. Retrieve all available room rates for your chosen result](https://duffel.com/docs/guides/getting-started-with-stays#2-retrieve-all-available-room-rates-for-your-chosen-result)

[3\. Request a final quote for your selected rate](https://duffel.com/docs/guides/getting-started-with-stays#3-request-a-final-quote-for-your-selected-rate)

[4\. Create a booking](https://duffel.com/docs/guides/getting-started-with-stays#4-create-a-booking)

[Learn more](https://duffel.com/docs/guides/getting-started-with-stays#learn-more)

We use cookies to improve your experience and for marketing. [See our cookie policy.](https://duffel.com/cookies-policy)

Allow allReject allManage cookies