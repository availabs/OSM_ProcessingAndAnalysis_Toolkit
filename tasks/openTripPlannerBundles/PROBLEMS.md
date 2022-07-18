# Problems Creating OpenTripPlanner input data

## Transit Service Period

The OTP transit service period will be the intersection of all the individual GTFS
feeds date ranges.

OTP Configuration: [Limit the transit service period](https://docs.opentripplanner.org/en/dev-2.x/BuildConfiguration/#limit-the-transit-service-period)

## Westchester_County_Bee-Line_System GTFS Shapes

The
[Sept2021.zip](https://transit-admin.511ny.org/feed/e3571abf-0284-4b6d-8a3c-0a9f8dbd8d33/version/45)
does not include a
[shapes.txt](https://developers.google.com/transit/gtfs/reference#shapestxt) file.

NOTE: ALL Westchester GTFS feeds between the following dates are missing the shapes.txt file.

- [03/06/2021](https://transit-admin.511ny.org/feed/e3571abf-0284-4b6d-8a3c-0a9f8dbd8d33/version/43)
- [03/15/2022](https://transit-admin.511ny.org/feed/e3571abf-0284-4b6d-8a3c-0a9f8dbd8d33/version/48)

## NJ & CT

Include NJ & CT OSM?

## transit-admin.511ny.org page crashing for some GTFS agencies.

The transit-admin.511ny.org [NYSDOT / Metro-North Railroad](https://transit-admin.511ny.org/feed/f3bfba4d-7137-49e7-8796-a53efc989458) page will not load.

```
Error (404) making get request to /api/manager/secure/feedversionsummaries?feedSourceId=f3bfba4d-7137-49e7-8796-a53efc989458
```

For this reason, I downloaded the Metro-North GTFS Feed from the [MTA web site](http://web.mta.info/developers/data/mnr/google_transit.zip)
