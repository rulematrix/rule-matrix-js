import * as d3 from 'd3';
export function createStreams(raw) {
    raw.forEach(function (stream) {
        if (!stream.processed) {
            stream.stream = d3.transpose(stream.stream);
            stream.processed = true;
        }
    });
    return raw;
}
export function createConditionalStreams(raw) {
    return raw.map(function (streams) { return createStreams(streams); });
}
export function isConditionalStreams(streams) {
    return Array.isArray(streams[0]);
}
var DataSet = /** @class */ (function () {
    function DataSet(raw) {
        var data = raw.data, target = raw.target, hists = raw.hists, name = raw.name, ratios = raw.ratios;
        this.data = data.map(function (d) { return new Float32Array(d); });
        this.target = new Int32Array(target);
        this.hists = hists;
        this.name = name;
        this.ratios = ratios;
        // this.discretizers = discretizers;
        // this.categoryInterval = this.categoryInterval.bind(this);
        // this.categoryDescription = this.categoryDescription.bind(this);
        // this.categoryHistRange = this.categoryHistRange.bind(this);
        // this.interval2HistRange = this.interval2HistRange.bind(this);
        // this.categorical = categorical;
    }
    return DataSet;
}());
export { DataSet };
var Matrix = /** @class */ (function () {
    function Matrix(size1, size2) {
        this.data = new Float32Array(size1 * size2);
    }
    return Matrix;
}());
export { Matrix };
export function isSupportMat(support) {
    return Array.isArray(support[0][0]);
}
