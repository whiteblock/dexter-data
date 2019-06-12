import { DateTime, Interval } from 'luxon';

function dt(ms: number): DateTime {
  return DateTime.fromMillis(ms, { zone: 'UTC' });
}

/**
 * given interval is the time at a boundary
 * @param {Interval} interval - InfluxDB duration notation, eg. 1m, 5m, 1d
 * @param {DateTime} time - A time
 */
function isIntervalBoundary(
  interval: string,
  time: DateTime,
  now: DateTime = DateTime.utc()) : boolean {

  const match  = interval.match(/(\d+)(\w+)/);
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

function intervalToMilliseconds(interval: string): number {
  const match  = interval.match(/(\d+)(\w+)/);
  if (!match) {
    throw new Error(`Invalid interval: '${interval}'`);
  }
  const nu = match[1];
  const unit = match[2];
  const n = Math.min(parseInt(nu, 10));
  // const now = DateTime.local();
  // const dayOfYear = Math.floor(
  //   Interval.fromDateTimes(DateTime.local(now.year, 1, 1), now).length() + 1);
  switch (unit) {
    case 'm':
      return 1000 * 60 * n;
    case 'h':
      return 1000 * 60 * 60 * n;
    case 'd':
      return 1000 * 60 * 60 * 24 * n;
  }
  throw new Error(`Unsupported interval: '${interval}'`);
}

/**
 *
 */
function timestampForInterval(interval: string, seconds: number): number {
  const ints = intervalToMilliseconds(interval);
  const diff = seconds % ints;
  return seconds - diff;
}

export default {
  dt,
  isIntervalBoundary,
  intervalToMilliseconds,
  timestampForInterval,
};
