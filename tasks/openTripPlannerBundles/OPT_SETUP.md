# Open Trip Planner Server

## TL;DR

- Install Java 17

```sh
$ java -version
openjdk version "17.0.3" 2022-04-19
OpenJDK Runtime Environment Temurin-17.0.3+7 (build 17.0.3+7)
```

- Build the graph

```sh
./buildGraph
```

- Start the server

```sh
$ ./startServer
```

# Build the graph

From [OpenTripPlanner Basic Tutorial](http://docs.opentripplanner.org/en/dev-2.x/Basic-Tutorial/#building-graphs)

> There are two main phases to preparing and deploying an OTP server. The first
> is to analyze the GTFS, OSM and any other inputs (such as elevation data) and
> build a representation of the transportation network. Following mathematical
> terminology we call this a 'graph', and refer to this phase as "graph
> building". The second phase is to start a server that provides trip planning
> and other API services for this graph.
>
> It is possible to save the graph to a file on disk after the first phase,
> then load the graph from the file in the second phase. This allows restarting
> the server or starting multiple instances of the server without repeating the
> often time-consuming process of building the graph. It is also possible to
> split the graph building process into separate OSM and GTFS stages for
> similar reasons: to allow reusing results from slow processes, such as
> applying elevation data to streets. These different options are controlled
> with command line switches, and will be described in more detail below and in
> other tutorials.

```sh
$ cat buildGraph
#!/bin/bash

REGION=nymtc

# https://stackoverflow.com/a/69179997/3970755
java \
  --add-opens=java.base/java.lang=ALL-UNNAMED \
  --add-opens=java.base/java.lang.reflect=ALL-UNNAMED \
  --add-opens=java.base/java.io=ALL-UNNAMED \
  --add-opens=java.base/java.util=ALL-UNNAMED \
  -Xmx2G \
  -jar ./lib/otp-2.1.0-shaded.jar \
  --build \
  --save \
  bundles/$REGION
```

## Resources

- [OpenTripPlanner Basic Tutorial](http://docs.opentripplanner.org/en/dev-2.x/Basic-Tutorial/)

- [OpenTripPlanner - creating and querying your own multi-modal route planner](https://www.researchgate.net/publication/321110774_OpenTripPlanner_-_creating_and_querying_your_own_multi-modal_route_planner)
