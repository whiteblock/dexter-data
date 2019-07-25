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
 * Convert an timeframe into minutes.
 * @param   timeframe  A duration in InfluxDB notation
 * @returns            The duration of the timeframe in milliseconds
 */
function timeframeToMinutes(timeframe: string): number {
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
      return n;
    case 'h':
      return 60 * n;
    case 'd':
      return 24 * 60 * n;
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
  const ints = timeframeToMinutes(timeframe) * 60 * 1000;
  const diff = ms % ints;
  return ms - diff;
}

/**
 * Normalize a list of timeframes to minutes
 * @param timeframes An array of timeframes supported by an exchange
 * @returns          A list of minutes
 */
function minutesFromTimeframes(timeframes: Array<string>): Array<number> {
  return timeframes.map(timeframeToMinutes);
}

/**
 * Translate raw minutes back to timeframe notation
 * @param timeframes An array of timeframes supported by an exchange
 * @returns          A hashmap with raw minutes as keys and timeframes as values
 */
function reverseMapMinutesToTimeframes(timeframes: Array<string>): { [minutes: number]: string } {
  return timeframes.reduce((m: { [minutes: number]: string }, a) => {
    try {
      const minutes = timeframeToMinutes(a);
      m[minutes] = a;
      return m;
    } catch {
      return m;
    }
  }, {});
}


/**
 * Return the highest native timeframe that is evenly divisible into the given timeframe.
 * @param nativeTimeframes An array of timeframes supported by an exchange.
 * @param timeframe        The timeframe we want to emulate later
 * @returns                The highest common timeframe
 */
function highestCommonTimeframe(nativeTimeframes: Array<string>, timeframe: string): number {
  const minutes = minutesFromTimeframes(nativeTimeframes).sort((a, b) => b - a);
  const base = timeframeToMinutes(timeframe);
  // console.log({ minutes });
  const common = minutes.find((t) => {
    // console.log(`base(${base}) % t(${t}) == ${ base % 5 }`);
    return (base % t) === 0;
  });
  if (common) {
    return common;
  }
  throw(new Error(`Common timeframe not found for ${timeframe}`));
}

function emulateTimeframeCandles(timeframe: string, commonTimeframe: string, candles: any): any {
  const a = timeframeToMinutes(timeframe);
  const b = timeframeToMinutes(commonTimeframe);
  const factor = a / b;
  const emulatedCandles: any = [];
  for (let i = 0; i < candles.length; i += 1) {
  }
  return emulatedCandles;
}

export default {
  dt,
  isTimeframeBoundary,
  timeframeToMinutes,
  timestampForTimeframe,
  minutesFromTimeframes,
  reverseMapMinutesToTimeframes,
  highestCommonTimeframe,
  emulateTimeframeCandles,
};
