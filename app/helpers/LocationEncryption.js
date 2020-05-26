/**
 * Generate a set of location hashes from a location
 */
const geohash = require('ngeohash');

import scrypt from 'react-native-scrypt';

const DEFAULT_SALT = 'salt';
const GEO_CIRCLE_RADII = [
  { latitude: 0, longitude: 0 }, // center
  { latitude: 0.0001, longitude: 0 }, // N
  { latitude: 0.00007, longitude: 0.00007 }, // NE
  { latitude: 0, longitude: 0.0001 }, // E
  { latitude: -0.00007, longitude: 0.00007 }, // SE
  { latitude: -0.0001, longitude: 0 }, // S
  { latitude: -0.00007, longitude: -0.00007 }, // SW
  { latitude: 0, longitude: -0.0001 }, // W
  { latitude: 0.00007, longitude: -0.00007 }, // NW
];

/**
 * Rounds down timestamp to the nearest interval window
 *
 * @param {number} timestamp - Unix timestamps in milliseconds
 * @param {number} interval - location storage interval in milliseconds
 */
const roundToInterval = (timestamp, interval) => {
  return Math.floor(timestamp / interval) * interval;
};

/**
 * Generates time windows for interval before and after timestamp
 *
 * @param {number} timestamp - Unix timestamps in milliseconds
 * @param {number} interval - location storage interval in milliseconds
 */
const getTimeWindows = (timestamp, interval) => {
  const time1 = timestamp + interval / 2;
  const time2 = timestamp - interval / 2;
  return [roundToInterval(time1, interval), roundToInterval(time2, interval)];
};

/**
 * Generates array of geohashes within a 10 meter radius of given location
 *
 * @param {object} location - { latitude, longitude }
 */
export const getGeohashes = location => {
  const locations = [];
  for (let i = 0; i < GEO_CIRCLE_RADII.length; i++) {
    const geoCirclePoint = GEO_CIRCLE_RADII[i];
    locations.push({
      ...location,
      latitude: location.latitude + geoCirclePoint.latitude,
      longitude: location.longitude + geoCirclePoint.longitude,
    });
  }

  const geoHashes = [];
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const locGeohash = geohash.encode(loc.latitude, loc.longitude, 8);
    // console.log(geohash.encode(loc.latitude, loc.longitude, 8));
    if (!geoHashes.includes(locGeohash)) {
      geoHashes.push(locGeohash);
    }
  }
  return geoHashes;
};

/**
 * Generates array of location strings within a 10 meter radius of given location by concatenating each geohash with both time windows
 *
 * @param {object} location - { latitude, longitude, time }
 * @param {number} interval - location storage interval in milliseconds
 */
export const getLocationStrings = (location, interval) => {
  const geohashes = getGeohashes(location);
  const timeWindows = getTimeWindows(location.time, interval);
  const locationStrings = [];

  for (let i = 0; i < geohashes.length; i++) {
    locationStrings.push(geohashes[i] + timeWindows[0]);
    locationStrings.push(geohashes[i] + timeWindows[1]);
  }

  return locationStrings;
};

const generateScryptSalt = (saltString = DEFAULT_SALT) => {
  return saltString.split('').map(char => char.charCodeAt(0));
};

/**
 * Hashes locationString using Scrypt
 *
 * @param {string} locationString
 */
export const scryptEncode = async locationString => {
  let scryptHash;
  const salt = generateScryptSalt();
  try {
    scryptHash = await scrypt(locationString, salt, 16384, 8, 1, 8);
  } catch (e) {
    console.log(e);
    return null;
  }
  return scryptHash;
};

/**
 * Generates array of location strings and then hashes them using Scrypt
 *
 * @param {object} location - { latitude, longitude, time }
 * @param {number} interval - location storage interval in milliseconds
 */
export const getLocationHashes = async (location, interval) => {
  const locationStrings = getLocationStrings(location, interval);
  const scryptPromises = locationStrings.map(
    async locationString => await scryptEncode(locationString),
  );
  return Promise.all(scryptPromises);
};
