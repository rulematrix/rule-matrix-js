"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var d3ScaleChromatic = require("d3-scale-chromatic");
var gColor = [
    '#3366cc',
    '#ff9900',
    '#109618',
    '#990099',
    '#dc3912',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac'
];
exports.googleColor = function (n) { return gColor[n % gColor.length]; };
exports.defaultColor = d3.scaleOrdinal(d3ScaleChromatic.schemeSet1);
// export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
// export const labelColor: ColorType = d3.scaleOrdinal<number, string>(d3.schemeCategory20 as string[]);
exports.labelColor = exports.googleColor;
exports.sequentialColors = function (n) {
    return (d3.scaleOrdinal(d3ScaleChromatic.schemeBlues[n]));
};
exports.divergingColors = function (n) {
    return (d3.scaleOrdinal(d3ScaleChromatic.schemeRdBu[n]));
};
exports.defaultDuration = 400;
