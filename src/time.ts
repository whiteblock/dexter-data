import { DateTime, Interval } from 'luxon';

/**
 * Create a DateTime instance from milliseconds.
 * @param ms A timestamp in milliseconds
 * @returns A DateTime instance
 */
function dt(ms: number): DateTime {
  return DateTime.fromMillis(ms, { zone: 'UTC' });
}

/**
 * Return true if the given `time` is on an timeframe boundary.
 *
 * @param timeframe  InfluxDB duration notation, eg. 1m, 5m, 1d
 * @param time       A time
 * @returns          `true` if the timestamp is on an timeframe boundary.`
 */
function isTimeframeBoundary(
  timeframe: string,
  time: DateTime,
  now: DateTime = DateTime.utc()) : boolean {

  const match  = timeframe.match(/(\d+)(\w+)/);
  if (!match) {
    return false;
  }
  const nu = match[1];
  const unit = match[2];
  const n = Math.min(parseInt(nu, 10));
  const dayOfYear = Math.floor(
    Interval.fromDateTimes(DateTime.utc(now.year, 1, 1), now).length() + 1);

  switch (unit) {
    case 'm':
      if (time.minute % n === 0) return true;
      break;
    case 'h':
      if (time.hour % n === 0 && time.minute === 0) return true;
      break;
    case 'd':
      if (time.minute === 0 && time.hour === 0 && dayOfYear % n === 0) return true;
      break;
  }
  return false;
}

/**
 * Convert an timeframe into milliseconds.
 * @param   timeframe  A duration in InfluxDB notation
 * @returns            The duration of the timeframe in milliseconds
 */
function timeframeToMilliseconds(timeframe: string): number {
  const match  = timeframe.match(/(\d+)(\w+)/);
  if (!match) {
    throw new Error(`Invalid timeframe: '${timeframe}'`);
  }
  const nu = match[1];
  const unit = match[2];
  const n = Math.min(parseInt(nu, 10));
  // const now = DateTime.local();
  // const dayOfYear = Math.floor(
  //   Timeframe.fromDateTimes(DateTime.local(now.year, 1, 1), now).length() + 1);
  switch (unit) {
    case 'm':
      return 1000 * 60 * n;
    case 'h':
      return 1000 * 60 * 60 * n;
    case 'd':
      return 1000 * 60 * 60 * 24 * n;
  }
  throw new Error(`Unsupported timeframe: '${timeframe}'`);
}

/**
 * Given an timeframe and a timestamp, adjust the timestamp so that it fits inside the timeframe.
 * @param timeframe A duration in InfluxDB notation
 * @param ms        A timestamp in milliseconds
 * @returns         An adjusted timestamp in milliseconds that fits inside `timeframe`
 */
function timestampForTimeframe(timeframe: string, ms: number): number {
  const ints = timeframeToMilliseconds(timeframe);
  const diff = ms % ints;
  return ms - diff;
}

function highestCommonTimeframe(nativeTimeframes: Array<string>, timeframe: string) {
}

export default {
  dt,
  isTimeframeBoundary,
  timeframeToMilliseconds,
  timestampForTimeframe,
};
