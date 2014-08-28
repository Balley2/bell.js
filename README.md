Bell
====

Realtime anomalies detection based on statsd,
for periodic time series.

![](https://github.com/eleme/node-bell/raw/master/snap.png)

Latest version: v0.2.1

Requirements
------------

- [node.js](http://nodejs.org/) 0.11.x
- [ssdb](https://github.com/ideawu/ssdb) 1.6.8.8+
- [beanstalkd](https://github.com/kr/beanstalkd)
- [statsd](https://github.com/etsy/statsd)

Installation
------------

```bash
npm install node-bell -g
```

then add `node-bell` to statsd's backends in statsd's config.js:

```js
{
, backends: ["node-bell"]
}
```

Quick Start
-----------

1. Start ssdb & beanstalkd.
2. Generate sample configuration and edit it, default [config/configs.toml](config/configs.toml):

   ```bash
   $ bell -s
   $ mv sample.configs.toml configs.toml
   $ vi configs.toml
   ```
3. Start listener & analyzers (optional: webapp).

   ```bash
   bell analyzer -c configs.toml
   bell listener -c configs.toml  # default port: 8889
   bell webapp -c configs.toml  # default port: 8989
   ```

4. Start statsd.

Services
--------

1. **listener**: receives incoming metrics from statsd, then put them to job queue.
2. **analyzer(s)**: get job from job queue, and then analyze if current metric an anomaly or not.
3. **webapp**: visualizes analyzation result on web.

Events & Hooks
--------------

Hook modules are Node.js modules that listen for events from node-bell.
Each hook module shoule export the following initialization function:

- `init(configs, analyzer, log)`

Events currently available:

- Event **'anomaly detected'**

   Parameters: `(datapoint, multiples)`

   Emitted when an anomaly was detected.

Built-in hook module (and sample hook): [hook](hook).

Look Inside
-----------

### Algorithm

**3-sigma** or called **68-95-99.7** rule, [reference](http://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule)

![](http://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Standard_deviation_diagram.svg/350px-Standard_deviation_diagram.svg.png)

### Storage

Analyzers store metrics in ssdb, using zset, here is storage format for a single time series:

```
key       |  score
-----------------------------------------------
timestamp | value:anomalous multiples:timestamp
```

### Data Flow


```
 [statsd]
    |
    v        send to queue
[listener] -----------------> [beanstalkd]
                                  |
                                  | reserve
            history metrics       v       record anomalies
            ---------------> [analyzers] ----------------
            |                     |                     |
            |                     | put to ssdb         |
            |                     v                     |
            ------------------- [ssdb] <-----------------
                                  |
                                  |
                                  v
                               [webapp]
```

FAQ
---

[FAQ.md](FAQ.md)

License
--------

MIT.  Copyright (c) 2014 Eleme, Inc.
