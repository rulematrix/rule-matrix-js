"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var Painter_1 = require("./Painter");
// import * as nt from '../../service/num';
require("./HistPainter.css");
var StreamPainter = /** @class */ (function () {
    function StreamPainter() {
        this.params = tslib_1.__assign({}, (StreamPainter.defaultParams));
    }
    StreamPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (StreamPainter.defaultParams), (this.params), params);
        return this;
    };
    StreamPainter.prototype.data = function (newData) {
        this.stream = newData;
        return this;
    };
    StreamPainter.prototype.render = function (selector) {
        var _a = this.params, margin = _a.margin, color = _a.color, duration = _a.duration, width = _a.width, height = _a.height, range = _a.range;
        var streamData = this.stream;
        var xs = this.params.xs || d3.range(streamData.length);
        // const step = xs[1] - xs[0];
        var xRange = range || [xs[0], xs[xs.length - 1]];
        // xs = [xRange[0], ...xs, xRange[1]];
        var nStreams = streamData.length ? streamData[0].length : 0;
        var stackLayout = d3.stack()
            .keys(d3.range(nStreams)).offset(d3.stackOffsetSilhouette);
        var stackedStream = stackLayout(streamData);
        var yMin = d3.min(stackedStream, function (stream) { return d3.min(stream, function (d) { return d[0]; }); }) || 0;
        var yMax = d3.max(stackedStream, function (stream) { return d3.max(stream, function (d) { return d[1]; }); }) || 0;
        var diff = Math.max(0, (this.params.yMax || 0) - (yMax - yMin));
        // if (streamData.length) {
        //   console.log(yMax); // tslint:disable-line
        //   console.log(yMin); // tslint:disable-line
        //   console.log(diff);  // tslint:disable-line
        //   console.log(streamData.map(s => nt.sum(s))); // tslint:disable-line
        // }
        var xScaler = d3.scaleLinear()
            .domain(xRange).range([margin.left, width - margin.right]);
        var yScaler = d3.scaleLinear()
            .domain([yMin - diff / 2, yMax + diff / 2]).range([margin.bottom, height - margin.top]);
        var area = d3.area()
            .x(function (d, i) { return xScaler(xs[i]); })
            .y0(function (d, i) { return yScaler(d[0]); })
            .y1(function (d, i) { return yScaler(d[1]); })
            .curve(d3.curveCardinal.tension(0.3));
        var initPos = area(new Array(streamData.length).fill([0, 1e-6]));
        // Join
        var paths = selector.selectAll('path').data(stackedStream);
        // Enter
        var pathEnter = paths.enter().append('path')
            .attr('d', initPos);
        // Update
        var pathUpdate = pathEnter.merge(paths).style('fill', function (d, i) { return color(i); });
        pathUpdate.transition().duration(duration)
            .attr('d', area);
        // Exit
        paths.exit().transition().duration(duration)
            .attr('d', this.initPos).remove();
        this.renderBrush(selector, xScaler);
        this.initPos = initPos;
        return this;
    };
    StreamPainter.prototype.renderBrush = function (selector, xScaler) {
        var _a = this.params, interval = _a.interval, duration = _a.duration, margin = _a.margin, height = _a.height;
        var rangeRect = selector.selectAll('rect.hp-brush')
            .data((interval && this.stream.length) ? [interval] : []);
        rangeRect.exit().transition().duration(duration)
            .attr('height', 1e-6).attr('y', height / 2).remove();
        if (!(interval && xScaler))
            return this;
        var rangeEnter = rangeRect.enter().append('rect').attr('class', 'hp-brush');
        var rangeUpdate = rangeEnter.merge(rangeRect);
        rangeUpdate.transition().duration(duration)
            .attr('width', xScaler(interval[1]) - xScaler(interval[0])).attr('x', xScaler(interval[0]))
            .attr('height', height - margin.top - margin.bottom).attr('y', margin.top);
        return this;
    };
    StreamPainter.defaultParams = {
        color: Painter_1.defaultColor,
        duration: Painter_1.defaultDuration,
        // mode: 'overlay',
        // padding: 4,
        margin: { top: 5, bottom: 5, left: 5, right: 5 },
        height: 50,
        width: 100,
    };
    return StreamPainter;
}());
exports.default = StreamPainter;
