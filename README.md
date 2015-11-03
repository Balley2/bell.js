Bell.js
=======

![snap](snap.png)

Introduction
------------

Bell.js is a real-time anomalies(outliers) detection system for periodic time
series, built to be able to monitor a large quantity of metrics. It collects
metrics form [statsd](https://github.com/etsy/statsd), analyzes them with the
[3-sigma](docs/design-notes.md), once enough anomalies were found in a short 
time it alerts us via sms/email etc.

We [eleme](github.com/eleme) use it to monitor our website/rpc interfaces,
including api called frequency, api response time(time cost per call) and
exceptions count. Our services send these statistics to statsd, statsd
aggregates them every 10 seconds and broadcasts the results to its backends
including bell, bell analyzes current stats with history data, calculates
the trending, and alerts us if the trending behaves anomalous.

Requirements
------------

- nodejs 0.12+ *(generator feature required)*
- beanstalkd (https://github.com/kr/beanstalkd) (we are using version 1.9)
- ssdb (https://github.com/ideawu/ssdb) (we are using version 1.6.8.8)

Installation
------------

1. Install `bell` as a system command:

    ```bash
    $ npm instal bell.js -g
    ```

2. Create config file according to [exampleConfig.js](exampleConfig.js).
3. Add module `bell` to statsd's backends in its config.js.

    ```js
    {
    , backends: ['bell']
    }
    ```

4. Start ssdb-server:

    ```bash
    $ ssdb-server -f path/to/ssdb.conf
    ```

5. Start beanstalkd:

    ```bash
    $ beanstalkd
    ```

6. Start bell services:

    ```bash
    $ bell analyzer -c config.js
    $ bell listener -c config.js
    $ bell webapp -c config.js
    $ bell alerter -c config.js
    $ bell cleaner -c config.js
    ```
    And I suggest you manage these services with something like supervisord.

Services
--------

Bell has 5 services (or process entries):

1. **listener**

    Receive incoming stats from statsd over tcp, pack to jobs and send them 
    to job queue. It starts on port 2015 by default.

2. **analyzer**

    Fetch jobs from queue, analyze current stats with history data via 
    [3-sigma rule](doc/design-notes.md)
    and send message to alerter once an anomaly was detected.

3. **webapp**

    Visualize analyzation results and provide alerting management.

4. **alerter**

    Alert via email or text message once enough anomalies were detected.

5. **cleaner**

    Clean metrics that has a long time not hitting bell.

Alerter Sender
---------------

A sender is a nodejs module which should export a function `sendEmail` or
`sendSms` (or both), see [exampleSender.js](exampleSender.js) for example.

Implementation Notes
--------------------

- [Anomalies detection algorithm](doc/design-notes.md#anomalies-detection-algorithm)
- [Eliminate periodicity](doc/design-notes.md#eliminate-periodicity)
- [Anomalous Serverity Trending](doc/design-notes.md#anomalous-serverity-trending)

License
-------

MIT Copyright (c) 2014 - 2015 Eleme, Inc.
