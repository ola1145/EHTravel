---
url: "https://duffel.com/docs/api/overview/flights-key-concepts"
title: "Flights key concepts | Duffel Documentation"
---

* * *

# Overview

You'll need to understand a few important concepts to get started with finding and booking flights using the Duffel API.

To search for flights, you create an **offer request**. An offer request describes the passengers and
where and when they want to travel (in the form of a list of **slices**). It may also include additional filters (for example,
a particular cabin to travel in).

A **slice** represents a journey that the passengers want to make between a particular origin and a particular destination.
For the origin and destination, you simply provide the IATA code for an **airport**, for example London Heathrow Airport (`LHR`)
or for a **city**, for example New York (`NYC`). An offer request includes one or more slices.

We'll send your search to a range of airlines, and come back to you with a series of **offers**. Each offer represents a
bundle of flights you can buy from an airline at a particular price that meet your search criteria. Each airline can
send back multiple offers, so you can potentially get back hundreds or even thousands.

Inside the offer, you'll see your slices, but now each slice will also include a list of one or more specific flights that the
airline is _offering_ to get the passengers where they want to go. Each flight is known as a **segment**. A journey from
London to New York could be direct, made up of one segment, or there could be one or more connections in the middle,
meaning multiple segments. All lists of slices and segments will be ordered by those departing first.

Once you've found an offer you want to book, you create an **order**, passing in the offer's ID, additional information about each
passengers (for example their name and date of birth) and payment information.

## One-way direct trip

![A one-way direct trip from LHR to NYC on 1st May](https://duffel.com/images/docs/key-concepts/one-way-direct-trip.webp)

A one-way direct trip from LHR to NYC on 1st May

We create an offer request for two passengers who want to travel from London Heathrow Airport (`LHR`) to New York (`NYC`)
on 1st May.

Duffel sends the search to a range of airlines, and gets an offer back from British Airways, costing £1,532. Inside the offer,
we have the slice we specified: `LHR` to `NYC` on 1st May.

Inside that slice, we have one segment: `LHR` to New York's John F Kennedy Airport (`JFK`), travelling on a British Airways
operated flight, `BA117`, departing at 08:30 on 1st May.

## One-way indirect trip

![A one-way indirect trip from LHR to NYC on 1st May, with a layover at BOS](https://duffel.com/images/docs/key-concepts/one-way-indirect-trip.webp)

A one-way indirect trip from LHR to NYC on 1st May, with a layover at BOS

We create an offer request, again for two passengers who want to travel from London Heathrow Airport (`LHR`) to New York (`NYC`)
on 1st May.

Duffel sends the search to a range of airlines, and gets an offer back from Virgin Atlantic, costing £482. Inside the offer,
we have the slice we specified: `LHR` to `NYC` on 1st May. But this time, inside that slice, we have two segments:

- `LHR` to Boston's Logan International Airport (`BOS`), travelling on `VS4011`, a flight marketed by Virgin Atlantic but operated
by Delta Air Lines, departing at 09:40 on 1st May

- `BOS` to New York's LaGuardia Airport (`LGA`), travelling on `VS3277`, a flight marketed by Virgin Atlantic but operated by Delta
Connection, departing at 14:00 local time on 1st May


## Return direct trip

![A return trip between LON to YTO, departing on 1st May and returning on 8th May](https://duffel.com/images/docs/key-concepts/return-direct-trip.webp)

A return trip between LON to YTO, departing on 1st May and returning on 8th May

We create another offer request, this time for one passenger who wants to travel from London (`LON`) to Toronto (`YTO`) on 1st
May and return on 8th May.

Duffel sends the search to a range of airlines, and gets an offer back from WestJet, costing £431. Inside the offer, we have
the two slices we specified: `LON` to `YTO` on 1st May, and `YTO` to `LON` on 8th May.

Inside the `LON` to `YTO` slice, we have one segment: London's Gatwick Airport (`LGW`) to Toronto's Pearson International Airport
(`YYZ`), travelling on a WestJet operated flight, `WS4`, departing at 12:50 on 1st May.

Inside the `YTO` to `LON` slice, we also have one segment: `YYZ` to `LGW`, travelling on a WestJet operated flight, `WS3`, departing
at 20:40 on 8th May.

## Return indirect trip

![A return indirect trip between LON to YTO, departing on 1st May and returning on 8th May. The return trip from YTO to LON has a layover at ORD](https://duffel.com/images/docs/key-concepts/return-indirect-trip.webp)

A return indirect trip between LON to YTO, departing on 1st May and returning on 8th May. The return trip from YTO to LON has a layover at ORD

We create the same offer request again: from London (`LON`) to Toronto (`YTO`) on 1st May, returning on 8th May, for one passenger.
Duffel sends the search to a range of airlines, and gets an offer back from Air Canada, costing £396. Inside the offer, we have
the two slices we specified: `LON` to `YTO` on 1st May, and `YTO` to `LON` on 8th May.

Inside the `LON` to `YTO` slice, we have one segment: `LHR` to `YYZ`, travelling on an Air Canada operated flight, `AC869`, departing
at 08:30 on 1st May.

But inside the `YTO` to `LON` slice, we have two segments:

- `YYZ` to Chicago's O'Hare International Airport (`ORD`), travelling on an Air Canada operated flight, `AC509`, departing at
14:55 on 8th May

- `ORD` to `LHR`, travelling on `AC5364`, a flight marketed by Air Canada but operated by United, departing at 18:25 on 8th May


## Multi-city direct trip

![A multi-city direct trip from Lon to JFK on 1st May, NYC to SFO on 4th May, and SFO to LON on 8th May](https://duffel.com/images/docs/key-concepts/multi-city-direct-trip.webp)

A multi-city direct trip from Lon to JFK on 1st May, NYC to SFO on 4th May, and SFO to LON on 8th May

A multi-city trip is one with more than two slices. For example, I might create an offer request for travel from
`LON` to `JFK` on 1st May, `NYC` to San Francisco International Airport (`SFO`) on 4th May, and `SFO` to `LON` on
8th May.

Duffel sends the search to a range of airlines, and gets an offer back from British Airways, costing £763.
Inside, we have three slices, each with one segment:

- `LHR` to `JFK`, travelling on a British Airways operated flight, `BA183`, departing at 19:50 on 1st May

- `JFK` to `SFO`, travelling on `AY76`, a flight marketed by Finnair but operated by American Airlines, departing at 07:00 on 4th May

- `SFO` to `LHR`, travelling on a British Airways operated flight, `BA284`, departing at 16:35 on 8th May


We use cookies to improve your experience and for marketing. [See our cookie policy.](https://duffel.com/cookies-policy)

Allow allReject allManage cookies