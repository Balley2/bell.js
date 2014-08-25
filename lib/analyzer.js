/* Analyze incoming metric from beanstalkd and store result into ssdb.
 */

var format = require('util').format;
var inherits = require('util').inherits;
var configs = require('./configs');
var log = require('./util').log;
var array = require('./util').array;
var Service = require('./service');


/*
 * analyzer: `beans.reserve` driven
 */

function Analyzer(){}

inherits(Analyzer, Service);


/*
 * save a datapoint to database
 */

Analyzer.prototype.save = function * (name, data, multi, time) {
  var score = time;
  var key = format('%s:%s:%d', data, multi, time);
  var maxSize = configs.ssdb.series.zsets.maxSize;
  var hash = configs.ssdb.allSeries.hashmap;
  var zset = configs.ssdb.series.zsets.namePrefix + name;
  var recent = configs.analyzer.severityTimeRecent;

  var paras = [
    this.ssdb.zsize(zset),
    this.ssdb.zset(zset, key, score),
  ];

  var size = (yield paras)[0];

  // limit single zset's size
  if (size > maxSize)
    yield this.ssdb.zremrangebyrank(zset, 0, size - maxSize);

  // multiples in recent 1 hour
  var list = yield this.ssdb.zkeys(zset, '', time - recent, time, -1);
  var series = [];

  for (var i = 0; i < list.length; i++) {
    series.push(+(list[i].split(':')[1]));
  }

  // set anomalous severity
  yield this.ssdb.hset(hash, name, +array(series).wma(0.6).toFixed(5));

  return key;
};


/*
 * filter datapoints by periodicity from ssdb
 */

Analyzer.prototype.filter = function * (zset, time) {
  var offset = configs.analyzer.filterOffset;
  var periodicity = configs.analyzer.periodicity;
  var span = offset * periodicity;

  var chunks = [];

  while (1) {
    var start = time - span, stop = time + span;
    var chunk = yield this.ssdb.zkeys(zset, '', start, stop, -1);
    if (!chunk.length) break;
    else {
      chunks.push(chunk);
      time -= periodicity;
    }
  }

  var series = [];

  for (var i = chunks.length - 1; i >= 0; i--) {
    Array.prototype.push.apply(series, chunks[i]);
  }
  return series;
};


/*
 * caculate 3-sigma multiples
 */

Analyzer.prototype.div3Sigma = function(series) {
  var strict = configs.analyzer.strict;
  var minSize = configs.analyzer.minSeriesSize;

  if (series.length < minSize) return 0;

  var tail;

  if (strict) {
    tail = series.slice(-1)[0];
  } else {
    tail = array(series.slice(-3)).mean();
  }

  var arr = array(series);
  var mean = arr.mean();
  var std = arr.std();
  var dis = Math.abs(tail - mean);

  if (!std)
    return dis ? -1 : 0;  // -1 for `-inf`
  return dis / (3 * std);
};


/*
 * analyze current metric
 */

Analyzer.prototype.analyze = function * (metric) {
  var name = metric[0];
  var time = metric[1][0];
  var data = metric[1][1];
  var zset = configs.ssdb.series.zsets.namePrefix + name;

  var start = new Date();  // measure time duration

  var series = [];
  var keys = yield this.filter(zset, time);

  for (var i = 0; i < keys.length; i++) {
    var val = parseFloat(keys[i].split(':')[0]);
    series.push(val);
  }
  series.push(data);

  var multi = +this.div3Sigma(series).toFixed(5);
  if (multi > 1) this.emit('anomaly detected', metric, multi);

  var key = yield this.save(name, data, multi, time);
  log.info('Analyzed (%sms) %s: %s', new Date() - start, name, key);
};


/*
 * serve forever
 */

Analyzer.prototype.serve = function * () {
  var self = this;

  /*
   * init hooks
   */
  if (configs.hooks.enable) {
    var hooks = configs.hooks.modules;
    for (var i = 0; i < hooks.length; i++) {
      log.debug('Load hook module: %s ..', hooks[i]);
      (require(hooks[i]).init)(configs, self, log);
    }
  }

  if (!this.ssdb) this.createSsdbClient();
  if (!this.beans) this.createBeansClient();
  yield this.connectBeans('watch');

  // fivebeans `destroy` needs a callback, shit
  var _beanscb = function(){};

  while (1) {
    var job = yield this.beans._reserve();
    var metric = JSON.parse(job.body);
    yield this.analyze(metric);
    this.beans.destroy(job.id, _beanscb);
  }
};

exports = module.exports = new Analyzer();
