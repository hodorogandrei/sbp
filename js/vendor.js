/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy representation conversion functions                        (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-dms.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
/* eslint no-irregular-whitespace: [2, { skipComments: true }] */

/**
 * Latitude/longitude points may be represented as decimal degrees, or subdivided into sexagesimal
 * minutes and seconds.
 *
 * @module dms
 */

/**
 * Functions for parsing and representing degrees / minutes / seconds.
 * @class Dms
 */

var Dms = {};

// note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 *
 * @example
 *     var lat = Dms.parseDMS('51° 28′ 40.12″ N');
 *     var lon = Dms.parseDMS('000° 00′ 05.31″ W');
 *     var p1 = new LatLon(lat, lon); // 51.4778°N, 000.0015°W
 */
Dms.parseDMS = function (dmsStr) {
    // check for signed decimal degrees without NSEW, if so return it directly
    if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);

    // strip off any sign or compass dir'n & split out separate d/m/s
    var dms = String(dmsStr).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
    if (dms[dms.length - 1] == '') dms.splice(dms.length - 1); // from trailing symbol

    if (dms == '') return NaN;

    // and convert to decimal degrees...
    var deg;
    switch (dms.length) {
        case 3:
            // interpret 3-part result as d/m/s
            deg = dms[0] / 1 + dms[1] / 60 + dms[2] / 3600;
            break;
        case 2:
            // interpret 2-part result as d/m
            deg = dms[0] / 1 + dms[1] / 60;
            break;
        case 1:
            // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            // check for fixed-width unseparated format eg 0033709W
            //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
            //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
            break;
        default:
            return NaN;
    }
    if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

    return Number(deg);
};

/**
 * Separator character to be used to separate degrees, minutes, seconds, and cardinal directions.
 *
 * Set to '\u202f' (narrow no-break space) for improved formatting.
 *
 * @example
 *   var p = new LatLon(51.2, 0.33);  // 51°12′00.0″N, 000°19′48.0″E
 *   Dms.separator = '\u202f';        // narrow no-break space
 *   var pʹ = new LatLon(51.2, 0.33); // 51° 12′ 00.0″ N, 000° 19′ 48.0″ E
 */
Dms.separator = '';

/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toDMS = function (deg, format, dp) {
    if (isNaN(deg)) return null; // give up here if we can't make a number from deg

    // default values
    if (format === undefined) format = 'dms';
    if (dp === undefined) {
        switch (format) {
            case 'd':case 'deg':
                dp = 4;break;
            case 'dm':case 'deg+min':
                dp = 2;break;
            case 'dms':case 'deg+min+sec':
                dp = 0;break;
            default:
                format = 'dms';dp = 0; // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg); // (unsigned result ready for appending compass dir'n)

    var dms, d, m, s;
    switch (format) {
        default: // invalid format spec!
        case 'd':case 'deg':
            d = deg.toFixed(dp); // round degrees
            if (d < 100) d = '0' + d; // pad with leading zeros
            if (d < 10) d = '0' + d;
            dms = d + '°';
            break;
        case 'dm':case 'deg+min':
            var min = (deg * 60).toFixed(dp); // convert degrees to minutes & round
            d = Math.floor(min / 60); // get component deg/min
            m = (min % 60).toFixed(dp); // pad with trailing zeros
            if (d < 100) d = '0' + d; // pad with leading zeros
            if (d < 10) d = '0' + d;
            if (m < 10) m = '0' + m;
            dms = d + '°' + Dms.separator + m + '′';
            break;
        case 'dms':case 'deg+min+sec':
            var sec = (deg * 3600).toFixed(dp); // convert degrees to seconds & round
            d = Math.floor(sec / 3600); // get component deg/min/sec
            m = Math.floor(sec / 60) % 60;
            s = (sec % 60).toFixed(dp); // pad with trailing zeros
            if (d < 100) d = '0' + d; // pad with leading zeros
            if (d < 10) d = '0' + d;
            if (m < 10) m = '0' + m;
            if (s < 10) s = '0' + s;
            dms = d + '°' + Dms.separator + m + '′' + Dms.separator + s + '″';
            break;
    }

    return dms;
};

/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLat = function (deg, format, dp) {
    var lat = Dms.toDMS(deg, format, dp);
    return lat === null ? '–' : lat.slice(1) + Dms.separator + (deg < 0 ? 'S' : 'N'); // knock off initial '0' for lat!
};

/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLon = function (deg, format, dp) {
    var lon = Dms.toDMS(deg, format, dp);
    return lon === null ? '–' : lon + Dms.separator + (deg < 0 ? 'W' : 'E');
};

/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toBrng = function (deg, format, dp) {
    deg = (Number(deg) + 360) % 360; // normalise -ve values to 180°..360°
    var brng = Dms.toDMS(deg, format, dp);
    return brng === null ? '–' : brng.replace('360', '0'); // just in case rounding took us up to 360°!
};

/**
 * Returns compass point (to given precision) for supplied bearing.
 *
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [precision=3] - Precision (1:cardinal / 2:intercardinal / 3:secondary-intercardinal).
 * @returns {string} Compass point for supplied bearing.
 *
 * @example
 *   var point = Dms.compassPoint(24);    // point = 'NNE'
 *   var point = Dms.compassPoint(24, 1); // point = 'N'
 */
Dms.compassPoint = function (bearing, precision) {
    if (precision === undefined) precision = 3;
    // note precision = max length of compass point; it could be extended to 4 for quarter-winds
    // (eg NEbN), but I think they are little used

    bearing = (bearing % 360 + 360) % 360; // normalise to 0..360

    var point;

    switch (precision) {
        case 1:
            // 4 compass points
            switch (Math.round(bearing * 4 / 360) % 4) {
                case 0:
                    point = 'N';break;
                case 1:
                    point = 'E';break;
                case 2:
                    point = 'S';break;
                case 3:
                    point = 'W';break;
            }
            break;
        case 2:
            // 8 compass points
            switch (Math.round(bearing * 8 / 360) % 8) {
                case 0:
                    point = 'N';break;
                case 1:
                    point = 'NE';break;
                case 2:
                    point = 'E';break;
                case 3:
                    point = 'SE';break;
                case 4:
                    point = 'S';break;
                case 5:
                    point = 'SW';break;
                case 6:
                    point = 'W';break;
                case 7:
                    point = 'NW';break;
            }
            break;
        case 3:
            // 16 compass points
            switch (Math.round(bearing * 16 / 360) % 16) {
                case 0:
                    point = 'N';break;
                case 1:
                    point = 'NNE';break;
                case 2:
                    point = 'NE';break;
                case 3:
                    point = 'ENE';break;
                case 4:
                    point = 'E';break;
                case 5:
                    point = 'ESE';break;
                case 6:
                    point = 'SE';break;
                case 7:
                    point = 'SSE';break;
                case 8:
                    point = 'S';break;
                case 9:
                    point = 'SSW';break;
                case 10:
                    point = 'SW';break;
                case 11:
                    point = 'WSW';break;
                case 12:
                    point = 'W';break;
                case 13:
                    point = 'WNW';break;
                case 14:
                    point = 'NW';break;
                case 15:
                    point = 'NNW';break;
            }
            break;
        default:
            throw new RangeError('Precision must be between 1 and 3');
    }

    return point;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Dms; // ≡ export default Dms

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model                       (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-ellipsoidal.html                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module != 'undefined' && module.exports) var Vector3d = require('./vector3d.js'); // ≡ import Vector3d from 'vector3d.js'
if (typeof module != 'undefined' && module.exports) var Dms = require('./dms.js'); // ≡ import Dms from 'dms.js'


/**
 * Library of geodesy functions for operations on an ellipsoidal earth model.
 *
 * Includes ellipsoid parameters and datums for different coordinate systems, and methods for
 * converting between them and to cartesian coordinates.
 *
 * q.v. Ordnance Survey ‘A guide to coordinate systems in Great Britain’ Section 6
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * @module   latlon-ellipsoidal
 * @requires dms
 */

/**
 * Creates lat/lon (polar) point with latitude & longitude values, on a specified datum.
 *
 * @constructor
 * @param {number}       lat - Geodetic latitude in degrees.
 * @param {number}       lon - Longitude in degrees.
 * @param {LatLon.datum} [datum=WGS84] - Datum this point is defined within.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0016, LatLon.datum.WGS84);
 */
function LatLon(lat, lon, datum) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, datum);

    if (datum === undefined) datum = LatLon.datum.WGS84;

    this.lat = Number(lat);
    this.lon = Number(lon);
    this.datum = datum;
}

/**
 * Ellipsoid parameters; major axis (a), minor axis (b), and flattening (f) for each ellipsoid.
 */
LatLon.ellipsoid = {
    WGS84: { a: 6378137, b: 6356752.31425, f: 1 / 298.257223563 },
    GRS80: { a: 6378137, b: 6356752.31414, f: 1 / 298.257222101 },
    Airy1830: { a: 6377563.396, b: 6356256.909, f: 1 / 299.3249646 },
    AiryModified: { a: 6377340.189, b: 6356034.448, f: 1 / 299.3249646 },
    Intl1924: { a: 6378388, b: 6356911.946, f: 1 / 297 },
    Bessel1841: { a: 6377397.155, b: 6356078.963, f: 1 / 299.152815351 }
};

/**
 * Datums; with associated ellipsoid, and Helmert transform parameters to convert from WGS 84 into
 * given datum.
 *
 * More are available from earth-info.nga.mil/GandG/coordsys/datums/NATO_DT.pdf,
 * www.fieldenmaps.info/cconv/web/cconv_params.js
 */
LatLon.datum = {
    /* eslint key-spacing: 0, comma-dangle: 0 */
    WGS84: {
        ellipsoid: LatLon.ellipsoid.WGS84,
        transform: { tx: 0.0, ty: 0.0, tz: 0.0, // m
            rx: 0.0, ry: 0.0, rz: 0.0, // sec
            s: 0.0 } // ppm
    },
    NAD83: { // (2009); functionally ≡ WGS84 - www.uvm.edu/giv/resources/WGS84_NAD83.pdf
        ellipsoid: LatLon.ellipsoid.GRS80,
        transform: { tx: 1.004, ty: -1.910, tz: -0.515, // m
            rx: 0.0267, ry: 0.00034, rz: 0.011, // sec
            s: -0.0015 } // ppm
    }, // note: if you *really* need to convert WGS84<->NAD83, you need more knowledge than this!
    OSGB36: { // www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
        ellipsoid: LatLon.ellipsoid.Airy1830,
        transform: { tx: -446.448, ty: 125.157, tz: -542.060, // m
            rx: -0.1502, ry: -0.2470, rz: -0.8421, // sec
            s: 20.4894 } // ppm
    },
    ED50: { // www.gov.uk/guidance/oil-and-gas-petroleum-operations-notices#pon-4
        ellipsoid: LatLon.ellipsoid.Intl1924,
        transform: { tx: 89.5, ty: 93.8, tz: 123.1, // m
            rx: 0.0, ry: 0.0, rz: 0.156, // sec
            s: -1.2 } // ppm
    },
    Irl1975: { // osi.ie/OSI/media/OSI/Content/Publications/transformations_booklet.pdf
        ellipsoid: LatLon.ellipsoid.AiryModified,
        transform: { tx: -482.530, ty: 130.596, tz: -564.557, // m
            rx: -1.042, ry: -0.214, rz: -0.631, // sec
            s: -8.150 } // ppm
    }, // note: many sources have opposite sign to rotations - to be checked!
    TokyoJapan: { // www.geocachingtoolbox.com?page=datumEllipsoidDetails
        ellipsoid: LatLon.ellipsoid.Bessel1841,
        transform: { tx: 148, ty: -507, tz: -685, // m
            rx: 0, ry: 0, rz: 0, // sec
            s: 0 } // ppm
    }
};

/**
 * Converts ‘this’ lat/lon coordinate to new coordinate system.
 *
 * @param   {LatLon.datum} toDatum - Datum this coordinate is to be converted to.
 * @returns {LatLon} This point converted to new datum.
 *
 * @example
 *     var pWGS84 = new LatLon(51.4778, -0.0016, LatLon.datum.WGS84);
 *     var pOSGB = pWGS84.convertDatum(LatLon.datum.OSGB36); // 51.4773°N, 000.0000°E
 */
LatLon.prototype.convertDatum = function (toDatum) {
    var oldLatLon = this;
    var transform;

    if (oldLatLon.datum == LatLon.datum.WGS84) {
        // converting from WGS 84
        transform = toDatum.transform;
    }
    if (toDatum == LatLon.datum.WGS84) {
        // converting to WGS 84; use inverse transform (don't overwrite original!)
        transform = {};
        for (var param in oldLatLon.datum.transform) {
            if (oldLatLon.datum.transform.hasOwnProperty(param)) {
                transform[param] = -oldLatLon.datum.transform[param];
            }
        }
    }
    if (transform === undefined) {
        // neither this.datum nor toDatum are WGS84: convert this to WGS84 first
        oldLatLon = this.convertDatum(LatLon.datum.WGS84);
        transform = toDatum.transform;
    }

    var oldCartesian = oldLatLon.toCartesian(); // convert polar to cartesian...
    var newCartesian = oldCartesian.applyTransform(transform); // ...apply transform...
    var newLatLon = newCartesian.toLatLonE(toDatum); // ...and convert cartesian to polar

    return newLatLon;
};

/**
 * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
 * (x/y/z) coordinates.
 *
 * @returns {Vector3d} Vector pointing to lat/lon point, with x, y, z in metres from earth centre.
 */
LatLon.prototype.toCartesian = function () {
    var φ = this.lat.toRadians(),
        λ = this.lon.toRadians();
    var h = 0; // height above ellipsoid - not currently used
    var a = this.datum.ellipsoid.a,
        f = this.datum.ellipsoid.f;

    var sinφ = Math.sin(φ),
        cosφ = Math.cos(φ);
    var sinλ = Math.sin(λ),
        cosλ = Math.cos(λ);

    var eSq = 2 * f - f * f; // 1st eccentricity squared ≡ (a²-b²)/a²
    var ν = a / Math.sqrt(1 - eSq * sinφ * sinφ); // radius of curvature in prime vertical

    var x = (ν + h) * cosφ * cosλ;
    var y = (ν + h) * cosφ * sinλ;
    var z = (ν * (1 - eSq) + h) * sinφ;

    var point = new Vector3d(x, y, z);

    return point;
};

/**
 * Converts ‘this’ (geocentric) cartesian (x/y/z) point to (ellipsoidal geodetic) latitude/longitude
 * coordinates on specified datum.
 *
 * Uses Bowring’s (1985) formulation for μm precision in concise form.
 *
 * @param {LatLon.datum.transform} datum - Datum to use when converting point.
 */
Vector3d.prototype.toLatLonE = function (datum) {
    var x = this.x,
        y = this.y,
        z = this.z;
    var a = datum.ellipsoid.a,
        b = datum.ellipsoid.b,
        f = datum.ellipsoid.f;

    var e2 = 2 * f - f * f; // 1st eccentricity squared ≡ (a²-b²)/a²
    var ε2 = e2 / (1 - e2); // 2nd eccentricity squared ≡ (a²-b²)/b²
    var p = Math.sqrt(x * x + y * y); // distance from minor axis
    var R = Math.sqrt(p * p + z * z); // polar radius

    // parametric latitude (Bowring eqn 17, replacing tanβ = z·a / p·b)
    var tanβ = b * z / (a * p) * (1 + ε2 * b / R);
    var sinβ = tanβ / Math.sqrt(1 + tanβ * tanβ);
    var cosβ = sinβ / tanβ;

    // geodetic latitude (Bowring eqn 18: tanφ = z+ε²bsin³β / p−e²cos³β)
    var φ = isNaN(cosβ) ? 0 : Math.atan2(z + ε2 * b * sinβ * sinβ * sinβ, p - e2 * a * cosβ * cosβ * cosβ);

    // longitude
    var λ = Math.atan2(y, x);

    // height above ellipsoid (Bowring eqn 7) [not currently used]
    var sinφ = Math.sin(φ),
        cosφ = Math.cos(φ);
    var ν = a / Math.sqrt(1 - e2 * sinφ * sinφ); // length of the normal terminated by the minor axis
    var h = p * cosφ + z * sinφ - a * a / ν;

    var point = new LatLon(φ.toDegrees(), λ.toDegrees(), datum);

    return point;
};

/**
 * Applies Helmert transform to ‘this’ point using transform parameters t.
 *
 * @private
 * @param {LatLon.datum.transform} t - Transform to apply to this point.
 */
Vector3d.prototype.applyTransform = function (t) {
    var x1 = this.x,
        y1 = this.y,
        z1 = this.z;

    var tx = t.tx,
        ty = t.ty,
        tz = t.tz;
    var rx = (t.rx / 3600).toRadians(); // normalise seconds to radians
    var ry = (t.ry / 3600).toRadians(); // normalise seconds to radians
    var rz = (t.rz / 3600).toRadians(); // normalise seconds to radians
    var s1 = t.s / 1e6 + 1; // normalise ppm to (s+1)

    // apply transform
    var x2 = tx + x1 * s1 - y1 * rz + z1 * ry;
    var y2 = ty + x1 * rz + y1 * s1 - z1 * rx;
    var z2 = tz - x1 * ry + y1 * rx + z1 * s1;

    var point = new Vector3d(x2, y2, z2);

    return point;
};

/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function (format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function () {
        return this * Math.PI / 180;
    };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function () {
        return this * 180 / Math.PI;
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon, module.exports.Vector3d = Vector3d; // ≡ export { LatLon as default, Vector3d }

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Ordnance Survey Grid Reference functions                           (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-gridref.html                                            */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-osgridref.html                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module != 'undefined' && module.exports) var LatLon = require('./latlon-ellipsoidal.js'); // ≡ import LatLon from 'latlon-ellipsoidal.js'


/**
 * Convert OS grid references to/from OSGB latitude/longitude points.
 *
 * Formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is inferior
 * to Krüger as used by e.g. Karney 2011.
 *
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * @module   osgridref
 * @requires latlon-ellipsoidal
 */
/*
 * Converted 2015 to work with WGS84 by default, OSGB36 as option;
 * www.ordnancesurvey.co.uk/blog/2014/12/confirmation-on-changes-to-latitude-and-longitude
 */

/**
 * Creates an OsGridRef object.
 *
 * @constructor
 * @param {number} easting - Easting in metres from OS false origin.
 * @param {number} northing - Northing in metres from OS false origin.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 */
function OsGridRef(easting, northing) {
    // allow instantiation without 'new'
    if (!(this instanceof OsGridRef)) return new OsGridRef(easting, northing);

    this.easting = Number(easting);
    this.northing = Number(northing);
}

/**
 * Converts latitude/longitude to Ordnance Survey grid reference easting/northing coordinate.
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {LatLon}    point - latitude/longitude.
 * @returns {OsGridRef} OS Grid Reference easting/northing.
 *
 * @example
 *   var p = new LatLon(52.65798, 1.71605);
 *   var grid = OsGridRef.latLonToOsGrid(p); // grid.toString(): TG 51409 13177
 *   // for conversion of (historical) OSGB36 latitude/longitude point:
 *   var p = new LatLon(52.65757, 1.71791, LatLon.datum.OSGB36);
 */
OsGridRef.latLonToOsGrid = function (point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    // if necessary convert to OSGB36 first
    if (point.datum != LatLon.datum.OSGB36) point = point.convertDatum(LatLon.datum.OSGB36);

    var φ = point.lat.toRadians();
    var λ = point.lon.toRadians();

    var a = 6377563.396,
        b = 6356256.909; // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717; // NatGrid scale factor on central meridian
    var φ0 = 49 .toRadians(),
        λ0 = (-2).toRadians(); // NatGrid true origin is 49°N,2°W
    var N0 = -100000,
        E0 = 400000; // northing & easting of true origin, metres
    var e2 = 1 - b * b / (a * a); // eccentricity squared
    var n = (a - b) / (a + b),
        n2 = n * n,
        n3 = n * n * n; // n, n², n³

    var cosφ = Math.cos(φ),
        sinφ = Math.sin(φ);
    var ν = a * F0 / Math.sqrt(1 - e2 * sinφ * sinφ); // nu = transverse radius of curvature
    var ρ = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinφ * sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν / ρ - 1; // eta = ?

    var Ma = (1 + n + 5 / 4 * n2 + 5 / 4 * n3) * (φ - φ0);
    var Mb = (3 * n + 3 * n * n + 21 / 8 * n3) * Math.sin(φ - φ0) * Math.cos(φ + φ0);
    var Mc = (15 / 8 * n2 + 15 / 8 * n3) * Math.sin(2 * (φ - φ0)) * Math.cos(2 * (φ + φ0));
    var Md = 35 / 24 * n3 * Math.sin(3 * (φ - φ0)) * Math.cos(3 * (φ + φ0));
    var M = b * F0 * (Ma - Mb + Mc - Md); // meridional arc

    var cos3φ = cosφ * cosφ * cosφ;
    var cos5φ = cos3φ * cosφ * cosφ;
    var tan2φ = Math.tan(φ) * Math.tan(φ);
    var tan4φ = tan2φ * tan2φ;

    var I = M + N0;
    var II = ν / 2 * sinφ * cosφ;
    var III = ν / 24 * sinφ * cos3φ * (5 - tan2φ + 9 * η2);
    var IIIA = ν / 720 * sinφ * cos5φ * (61 - 58 * tan2φ + tan4φ);
    var IV = ν * cosφ;
    var V = ν / 6 * cos3φ * (ν / ρ - tan2φ);
    var VI = ν / 120 * cos5φ * (5 - 18 * tan2φ + tan4φ + 14 * η2 - 58 * tan2φ * η2);

    var Δλ = λ - λ0;
    var Δλ2 = Δλ * Δλ,
        Δλ3 = Δλ2 * Δλ,
        Δλ4 = Δλ3 * Δλ,
        Δλ5 = Δλ4 * Δλ,
        Δλ6 = Δλ5 * Δλ;

    var N = I + II * Δλ2 + III * Δλ4 + IIIA * Δλ6;
    var E = E0 + IV * Δλ + V * Δλ3 + VI * Δλ5;

    N = Number(N.toFixed(3)); // round to mm precision
    E = Number(E.toFixed(3));

    return new OsGridRef(E, N); // gets truncated to SW corner of 1m grid square
};

/**
 * Converts Ordnance Survey grid reference easting/northing coordinate to latitude/longitude
 * (SW corner of grid square).
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {OsGridRef}    gridref - Grid ref E/N to be converted to lat/long (SW corner of grid square).
 * @param   {LatLon.datum} [datum=WGS84] - Datum to convert grid reference into.
 * @returns {LatLon}       Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var gridref = new OsGridRef(651409.903, 313177.270);
 *   var pWgs84 = OsGridRef.osGridToLatLon(gridref);                     // 52°39′28.723″N, 001°42′57.787″E
 *   // to obtain (historical) OSGB36 latitude/longitude point:
 *   var pOsgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36); // 52°39′27.253″N, 001°43′04.518″E
 */
OsGridRef.osGridToLatLon = function (gridref, datum) {
    if (!(gridref instanceof OsGridRef)) throw new TypeError('gridref is not OsGridRef object');
    if (datum === undefined) datum = LatLon.datum.WGS84;

    var E = gridref.easting;
    var N = gridref.northing;

    var a = 6377563.396,
        b = 6356256.909; // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717; // NatGrid scale factor on central meridian
    var φ0 = 49 .toRadians(),
        λ0 = (-2).toRadians(); // NatGrid true origin is 49°N,2°W
    var N0 = -100000,
        E0 = 400000; // northing & easting of true origin, metres
    var e2 = 1 - b * b / (a * a); // eccentricity squared
    var n = (a - b) / (a + b),
        n2 = n * n,
        n3 = n * n * n; // n, n², n³

    var φ = φ0,
        M = 0;
    do {
        φ = (N - N0 - M) / (a * F0) + φ;

        var Ma = (1 + n + 5 / 4 * n2 + 5 / 4 * n3) * (φ - φ0);
        var Mb = (3 * n + 3 * n * n + 21 / 8 * n3) * Math.sin(φ - φ0) * Math.cos(φ + φ0);
        var Mc = (15 / 8 * n2 + 15 / 8 * n3) * Math.sin(2 * (φ - φ0)) * Math.cos(2 * (φ + φ0));
        var Md = 35 / 24 * n3 * Math.sin(3 * (φ - φ0)) * Math.cos(3 * (φ + φ0));
        M = b * F0 * (Ma - Mb + Mc - Md); // meridional arc
    } while (N - N0 - M >= 0.00001); // ie until < 0.01mm

    var cosφ = Math.cos(φ),
        sinφ = Math.sin(φ);
    var ν = a * F0 / Math.sqrt(1 - e2 * sinφ * sinφ); // nu = transverse radius of curvature
    var ρ = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinφ * sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν / ρ - 1; // eta = ?

    var tanφ = Math.tan(φ);
    var tan2φ = tanφ * tanφ,
        tan4φ = tan2φ * tan2φ,
        tan6φ = tan4φ * tan2φ;
    var secφ = 1 / cosφ;
    var ν3 = ν * ν * ν,
        ν5 = ν3 * ν * ν,
        ν7 = ν5 * ν * ν;
    var VII = tanφ / (2 * ρ * ν);
    var VIII = tanφ / (24 * ρ * ν3) * (5 + 3 * tan2φ + η2 - 9 * tan2φ * η2);
    var IX = tanφ / (720 * ρ * ν5) * (61 + 90 * tan2φ + 45 * tan4φ);
    var X = secφ / ν;
    var XI = secφ / (6 * ν3) * (ν / ρ + 2 * tan2φ);
    var XII = secφ / (120 * ν5) * (5 + 28 * tan2φ + 24 * tan4φ);
    var XIIA = secφ / (5040 * ν7) * (61 + 662 * tan2φ + 1320 * tan4φ + 720 * tan6φ);

    var dE = E - E0,
        dE2 = dE * dE,
        dE3 = dE2 * dE,
        dE4 = dE2 * dE2,
        dE5 = dE3 * dE2,
        dE6 = dE4 * dE2,
        dE7 = dE5 * dE2;
    φ = φ - VII * dE2 + VIII * dE4 - IX * dE6;
    var λ = λ0 + X * dE - XI * dE3 + XII * dE5 - XIIA * dE7;

    var point = new LatLon(φ.toDegrees(), λ.toDegrees(), LatLon.datum.OSGB36);
    if (datum != LatLon.datum.OSGB36) point = point.convertDatum(datum);

    return point;
};

/**
 * Parses grid reference to OsGridRef object.
 *
 * Accepts standard grid references (eg 'SU 387 148'), with or without whitespace separators, from
 * two-digit references up to 10-digit references (1m × 1m square), or fully numeric comma-separated
 * references in metres (eg '438700,114800').
 *
 * @param   {string}    gridref - Standard format OS grid reference.
 * @returns {OsGridRef} Numeric version of grid reference in metres from false origin (SW corner of
 *   supplied grid square).
 * @throws Error on Invalid grid reference.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */
OsGridRef.parse = function (gridref) {
    gridref = String(gridref).trim();

    // check for fully numeric comma-separated gridref format
    var match = gridref.match(/^(\d+),\s*(\d+)$/);
    if (match) return new OsGridRef(match[1], match[2]);

    // validate format
    match = gridref.match(/^[A-Z]{2}\s*[0-9]+\s*[0-9]+$/i);
    if (!match) throw new Error('Invalid grid reference');

    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e100km = (l1 - 2) % 5 * 5 + l2 % 5;
    var n100km = 19 - Math.floor(l1 / 5) * 5 - Math.floor(l2 / 5);

    // skip grid letters to get numeric (easting/northing) part of ref
    var en = gridref.slice(2).trim().split(/\s+/);
    // if e/n not whitespace separated, split half way
    if (en.length == 1) en = [en[0].slice(0, en[0].length / 2), en[0].slice(en[0].length / 2)];

    // validation
    if (e100km < 0 || e100km > 6 || n100km < 0 || n100km > 12) throw new Error('Invalid grid reference');
    if (en.length != 2) throw new Error('Invalid grid reference');
    if (en[0].length != en[1].length) throw new Error('Invalid grid reference');

    // standardise to 10-digit refs (metres)
    en[0] = (en[0] + '00000').slice(0, 5);
    en[1] = (en[1] + '00000').slice(0, 5);

    var e = e100km + en[0];
    var n = n100km + en[1];

    return new OsGridRef(e, n);
};

/**
 * Converts ‘this’ numeric grid reference to standard OS grid reference.
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (10 digits = metres).
 * @returns {string} This grid reference in standard format.
 */
OsGridRef.prototype.toString = function (digits) {
    digits = digits === undefined ? 10 : Number(digits);
    if (isNaN(digits)) throw new Error('Invalid precision');

    var e = this.easting;
    var n = this.northing;
    if (isNaN(e) || isNaN(n)) throw new Error('Invalid grid reference');

    // use digits = 0 to return numeric format (in metres)
    if (digits == 0) return e.pad(6) + ',' + n.pad(6);

    // get the 100km-grid indices
    var e100k = Math.floor(e / 100000),
        n100k = Math.floor(n / 100000);

    if (e100k < 0 || e100k > 6 || n100k < 0 || n100k > 12) return '';

    // translate those into numeric equivalents of the grid letters
    var l1 = 19 - n100k - (19 - n100k) % 5 + Math.floor((e100k + 10) / 5);
    var l2 = (19 - n100k) * 5 % 25 + e100k % 5;

    // compensate for skipped 'I' and build grid letter-pairs
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letPair = String.fromCharCode(l1 + 'A'.charCodeAt(0), l2 + 'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor(e % 100000 / Math.pow(10, 5 - digits / 2));
    n = Math.floor(n % 100000 / Math.pow(10, 5 - digits / 2));

    var gridRef = letPair + ' ' + e.pad(digits / 2) + ' ' + n.pad(digits / 2);

    return gridRef;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

/** Extend Number object with method to pad with leading zeros to make it w chars wide
 *  (q.v. stackoverflow.com/questions/2998784 */
if (Number.prototype.pad === undefined) {
    Number.prototype.pad = function (w) {
        var n = this.toString();
        while (n.length < w) {
            n = '0' + n;
        }return n;
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = OsGridRef; // ≡ export default OsGridRef

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vector handling functions                                          (c) Chris Veness 2011-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-vector3d.html                               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

/**
 * Library of 3-d vector manipulation routines.
 *
 * In a geodesy context, these vectors may be used to represent:
 *  - n-vector representing a normal to point on Earth's surface
 *  - earth-centered, earth fixed vector (≡ Gade’s ‘p-vector’)
 *  - great circle normal to vector (on spherical earth model)
 *  - motion vector on Earth's surface
 *  - etc
 *
 * Functions return vectors as return results, so that operations can be chained.
 * @example var v = v1.cross(v2).dot(v3) // ≡ v1×v2⋅v3
 *
 * @module vector3d
 */

/**
 * Creates a 3-d vector.
 *
 * The vector may be normalised, or use x/y/z values for eg height relative to the sphere or
 * ellipsoid, distance from earth centre, etc.
 *
 * @constructor
 * @param {number} x - X component of vector.
 * @param {number} y - Y component of vector.
 * @param {number} z - Z component of vector.
 */
function Vector3d(x, y, z) {
    // allow instantiation without 'new'
    if (!(this instanceof Vector3d)) return new Vector3d(x, y, z);

    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
}

/**
 * Adds supplied vector to ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be added to this vector.
 * @returns {Vector3d} Vector representing sum of this and v.
 */
Vector3d.prototype.plus = function (v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
};

/**
 * Subtracts supplied vector from ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be subtracted from this vector.
 * @returns {Vector3d} Vector representing difference between this and v.
 */
Vector3d.prototype.minus = function (v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
};

/**
 * Multiplies ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to multiply this vector by.
 * @returns {Vector3d} Vector scaled by x.
 */
Vector3d.prototype.times = function (x) {
    x = Number(x);

    return new Vector3d(this.x * x, this.y * x, this.z * x);
};

/**
 * Divides ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to divide this vector by.
 * @returns {Vector3d} Vector divided by x.
 */
Vector3d.prototype.dividedBy = function (x) {
    x = Number(x);

    return new Vector3d(this.x / x, this.y / x, this.z / x);
};

/**
 * Multiplies ‘this’ vector by the supplied vector using dot (scalar) product.
 *
 * @param   {Vector3d} v - Vector to be dotted with this vector.
 * @returns {number} Dot product of ‘this’ and v.
 */
Vector3d.prototype.dot = function (v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return this.x * v.x + this.y * v.y + this.z * v.z;
};

/**
 * Multiplies ‘this’ vector by the supplied vector using cross (vector) product.
 *
 * @param   {Vector3d} v - Vector to be crossed with this vector.
 * @returns {Vector3d} Cross product of ‘this’ and v.
 */
Vector3d.prototype.cross = function (v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    var x = this.y * v.z - this.z * v.y;
    var y = this.z * v.x - this.x * v.z;
    var z = this.x * v.y - this.y * v.x;

    return new Vector3d(x, y, z);
};

/**
 * Negates a vector to point in the opposite direction
 *
 * @returns {Vector3d} Negated vector.
 */
Vector3d.prototype.negate = function () {
    return new Vector3d(-this.x, -this.y, -this.z);
};

/**
 * Length (magnitude or norm) of ‘this’ vector
 *
 * @returns {number} Magnitude of this vector.
 */
Vector3d.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

/**
 * Normalizes a vector to its unit vector
 * – if the vector is already unit or is zero magnitude, this is a no-op.
 *
 * @returns {Vector3d} Normalised version of this vector.
 */
Vector3d.prototype.unit = function () {
    var norm = this.length();
    if (norm == 1) return this;
    if (norm == 0) return this;

    var x = this.x / norm;
    var y = this.y / norm;
    var z = this.z / norm;

    return new Vector3d(x, y, z);
};

/**
 * Calculates the angle between ‘this’ vector and supplied vector.
 *
 * @param   {Vector3d} v
 * @param   {Vector3d} [vSign] - If supplied (and out of plane of this and v), angle is signed +ve if
 *     this->v is clockwise looking along vSign, -ve in opposite direction (otherwise unsigned angle).
 * @returns {number} Angle (in radians) between this vector and supplied vector.
 */
Vector3d.prototype.angleTo = function (v, vSign) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    var sinθ = this.cross(v).length();
    var cosθ = this.dot(v);

    if (vSign !== undefined) {
        if (!(vSign instanceof Vector3d)) throw new TypeError('vSign is not Vector3d object');
        // use vSign as reference to get sign of sinθ
        sinθ = this.cross(v).dot(vSign) < 0 ? -sinθ : sinθ;
    }

    return Math.atan2(sinθ, cosθ);
};

/**
 * Rotates ‘this’ point around an axis by a specified angle.
 *
 * @param   {Vector3d} axis - The axis being rotated around.
 * @param   {number}   theta - The angle of rotation (in radians).
 * @returns {Vector3d} The rotated point.
 */
Vector3d.prototype.rotateAround = function (axis, theta) {
    if (!(axis instanceof Vector3d)) throw new TypeError('axis is not Vector3d object');

    // en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    // en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Quaternion-derived_rotation_matrix
    var p1 = this.unit();
    var p = [p1.x, p1.y, p1.z]; // the point being rotated
    var a = axis.unit(); // the axis being rotated around
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    // quaternion-derived rotation matrix
    var q = [[a.x * a.x * (1 - c) + c, a.x * a.y * (1 - c) - a.z * s, a.x * a.z * (1 - c) + a.y * s], [a.y * a.x * (1 - c) + a.z * s, a.y * a.y * (1 - c) + c, a.y * a.z * (1 - c) - a.x * s], [a.z * a.x * (1 - c) - a.y * s, a.z * a.y * (1 - c) + a.x * s, a.z * a.z * (1 - c) + c]];
    // multiply q × p
    var qp = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            qp[i] += q[i][j] * p[j];
        }
    }
    var p2 = new Vector3d(qp[0], qp[1], qp[2]);
    return p2;
    // qv en.wikipedia.org/wiki/Rodrigues'_rotation_formula...
};

/**
 * String representation of vector.
 *
 * @param   {number} [precision=3] - Number of decimal places to be used.
 * @returns {string} Vector represented as [x,y,z].
 */
Vector3d.prototype.toString = function (precision) {
    var p = precision === undefined ? 3 : Number(precision);

    var str = '[' + this.x.toFixed(p) + ',' + this.y.toFixed(p) + ',' + this.z.toFixed(p) + ']';

    return str;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Vector3d; // ≡ export default Vector3d
//# sourceMappingURL=vendor.js.map
