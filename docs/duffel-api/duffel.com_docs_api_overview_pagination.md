---
url: "https://duffel.com/docs/api/overview/pagination"
title: "Pagination | Duffel Documentation"
---

* * *

# Pagination

Our list APIs (for example ["List offer requests"](https://duffel.com/docs/api/offer-requests/get-offer-requests) or
["List airports"](https://duffel.com/docs/api/airports/get-airports)) will only return a limited number of results at a time.

By default, we'll return 50 results per page, but you can set this to any number
between 1 and 200 with the `?limit` querystring parameter (for example by making
a request to `https://api.duffel.com/air/airports?limit=200`).

At the end of every list response, you'll see a `meta` object:

```
JSON
copy
{
  "meta": {
    "after": "g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=",
    "before": null,
    "limit": 50
  }
}
```

If `meta.after` is `null`, then there are no more results to see.

But if `meta.after` isn't `null`, then that means there are more results "over the page".

To look beyond this first page of results, you'll need to use our cursor-based
pagination functionality.

To see the next page, make a request to the same URL, but this time, add
`?after=${meta.after}` to the URL - so in this case, we'd add
`?after=g2wAAAACbQAAABBBZXJvbWlzdC1LaGFya2l2bQAAAB=`. You'll then see the next 50
results.

To see all of the results, repeat this process until `meta.after` is `null`.

We use cookies to improve your experience and for marketing. [See our cookie policy.](https://duffel.com/cookies-policy)

Allow allReject allManage cookies