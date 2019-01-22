"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var Painter_1 = require("./Painter");
var nt = require("../../service/num");
require("./HistPainter.css");
function checkBins(hists) {
    var nBins = hists[0].length;
    var equalBins = true;
    for (var i = 0; i < hists.length; ++i) {
        if (nBins !== hists[i].length)
            equalBins = false;
    }
    if (!equalBins) {
        console.warn('Hists not having the same number of bins!');
        hists.forEach(function (h) { return (nBins = Math.max(nBins, h.length)); });
    }
    return { nBins: nBins, equalBins: equalBins };
}
function brush(range, bars, x) {
    bars.classed('hp-hist-active', function (d, i) {
        var pos = x(d, i);
        return range[0] <= pos && pos < range[1];
    });
}
function computeLayout(hists, params) {
    var width = params.width, height = params.height, margin = params.margin, interval = params.interval, padding = params.padding, range = params.range;
    var nBins = checkBins(hists).nBins;
    var xs = params.xs || d3.range(nBins);
    var step = xs[1] - xs[0];
    var xRange = range || [xs[0] - step / 2, xs[xs.length - 1] + step / 2];
    var yMax = Math.max(d3.max(hists, function (hist) { return d3.max(hist); }) || 0, params.yMax || 0);
    var xScaler = d3
        .scaleLinear()
        .domain(xRange)
        .range([margin.left, width - margin.right]);
    var yScaler = d3
        .scaleLinear()
        .domain([yMax, 0])
        .range([margin.bottom, height - margin.top]);
    var bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
    var r0 = interval ? interval[0] : 0;
    var r1 = interval ? interval[1] : nBins;
    return { xs: xs, step: step, xScaler: xScaler, yScaler: yScaler, bandWidth: bandWidth, interval: [r0, r1] };
}
var HistPainter = /** @class */ (function () {
    function HistPainter() {
    }
    HistPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, HistPainter.defaultParams, this.params, params);
        return this;
    };
    HistPainter.prototype.data = function (newData) {
        this.hists = newData;
        return this;
    };
    HistPainter.prototype.render = function (selector) {
        switch (this.params.mode) {
            case 'overlay':
                this.renderOverlay(selector);
                break;
            case 'stack':
                this.renderStack(selector);
                break;
            default:
                break;
        }
        return this;
    };
    HistPainter.prototype.renderBrush = function (selector, xScaler) {
        var _a = this.params, interval = _a.interval, duration = _a.duration, margin = _a.margin, height = _a.height;
        var rangeRect = selector.selectAll('rect.hp-brush')
            .data((interval && this.hists.length) ? [interval] : []);
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
    HistPainter.prototype.renderOverlay = function (selector) {
        var _a = this.params, height = _a.height, color = _a.color, margin = _a.margin, duration = _a.duration, padding = _a.padding, opacity = _a.opacity;
        var hists = this.hists;
        // const histsPacked = packHists(hists, pack);
        var histG = selector.selectAll('g.hp-hists').data(hists);
        // Exit
        var exitTransition = histG
            .exit()
            .transition()
            .duration(duration)
            .remove();
        exitTransition.selectAll('rect').attr('y', height - margin.top).attr('height', 0);
        if (hists.length === 0) {
            this.renderBrush(selector);
            return this;
        }
        // Compute layout stuff
        var _b = computeLayout(hists, this.params), xs = _b.xs, step = _b.step, xScaler = _b.xScaler, yScaler = _b.yScaler, bandWidth = _b.bandWidth, interval = _b.interval;
        // const { nBins } = checkBins(hists);
        // const xs = this.params.xs || d3.range(nBins);
        // const step = xs[1] - xs[0];
        // const xRange = range || [xs[0] - step / 2, xs[xs.length - 1] + step / 2];
        // const yMax = d3.max(hists, hist => d3.max(hist)) as number;
        // // const chartWidth = width - margin.left - margin.right;
        // const xScaler = d3
        //   .scaleLinear()
        //   .domain(xRange)
        //   .range([margin.left, width - margin.right]);
        // const yScaler = d3
        //   .scaleLinear()
        //   .domain([yMax, 0])
        //   .range([margin.bottom, height - margin.top]);
        // const hScaler = d3
        //   .scaleLinear()
        //   .domain([0, yMax])
        //   .range([0, height - margin.top - margin.bottom]);
        // const bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
        // const r0 = interval ? interval[0] : 0;
        // const r1 = interval ? interval[1] : nBins;
        // Enter
        var histGEnter = histG
            .enter()
            .append('g')
            .attr('class', 'hp-hists');
        // console.log(color(0), color(1)); // tslint:disable-line
        // Merge
        var histGUpdate = histGEnter.merge(histG);
        histGUpdate
            .transition()
            .duration(duration)
            .style('fill', function (d, i) { return color(i); });
        /* RECTS START */
        var rects = histGUpdate
            .selectAll('rect')
            .data(function (d) { return Array.from(d, function (v, i) { return v; }); });
        // Enter
        var rectsEnter = rects
            .enter()
            .append('rect')
            .attr('x', function (d, i) { return xScaler(xs[i] - step / 2) + padding / 2; })
            .attr('y', height - margin.top)
            .attr('fill-opacity', opacity)
            .attr('width', bandWidth)
            .attr('height', 0);
        // Update
        var rectsUpdate = rectsEnter
            .merge(rects);
        // Transition
        rectsUpdate
            .transition()
            .duration(duration)
            .attr('x', function (d, i) { return xScaler(xs[i] - step / 2) + padding / 2; })
            .attr('y', yScaler)
            .attr('width', bandWidth)
            .attr('height', function (d) { return yScaler(0) - yScaler(d); });
        brush(interval, rectsUpdate, function (d, i) { return xs[i]; });
        // Rects Exit
        rects
            .exit()
            .transition()
            .duration(duration)
            .attr('y', height - margin.top)
            .attr('height', 0)
            .remove();
        /* RECTS END */
        // drawBrush
        this.renderBrush(selector, xScaler);
        return this;
    };
    HistPainter.prototype.renderStack = function (selector) {
        var _a = this.params, interval = _a.interval, width = _a.width, height = _a.height, color = _a.color, margin = _a.margin, duration = _a.duration, padding = _a.padding;
        var hists = this.hists;
        var histG = selector.selectAll('g.hp-hists').data(hists);
        // Exit
        var exitTransition = histG
            .exit()
            .transition()
            .duration(duration)
            .remove();
        exitTransition.attr('y', height - margin.top).attr('height', 0);
        if (hists.length === 0) {
            this.renderBrush(selector);
            return this;
        }
        var nBins = checkBins(hists).nBins;
        var xs = this.params.xs || d3.range(nBins);
        var y1s = nt.stack(hists);
        var y0s = tslib_1.__spread([new Array(hists[0].length).fill(0)], y1s.slice(0, -1));
        var yMax = d3.max(y1s[y1s.length - 1]);
        // const chartWidth = width - margin.left - margin.right;
        var xScaler = d3
            .scaleLinear()
            .domain([xs[0], xs[xs.length - 1]])
            .range([margin.left, width - margin.right]);
        var yScaler = d3
            .scaleLinear()
            .domain([yMax, 0])
            .range([margin.bottom, height - margin.top]);
        var bandWidth = xScaler(xs[1]) - xScaler(xs[0]) - padding;
        var r0 = interval ? interval[0] : 0;
        var r1 = interval ? interval[1] : nBins;
        // Enter
        var histGEnter = histG
            .enter()
            .append('g')
            .attr('class', 'hists');
        // Merge
        var histGUpdate = histGEnter.merge(histG);
        histGUpdate
            .transition()
            .duration(duration)
            .style('fill', function (d, i) { return color(i); });
        /* RECTS START */
        var rects = histGUpdate
            .selectAll('rect')
            .data(function (d, i) {
            return Array.from(d, function (v, j) { return [y0s[i][j], y1s[i][j]]; });
        });
        // Enter
        var rectsEnter = rects
            .enter()
            .append('rect')
            .attr('y', height - margin.top)
            .attr('height', 0);
        // Update
        var rectsUpdate = rectsEnter
            .merge(rects)
            .attr('x', function (d, i) { return xScaler(xs[i]) + padding / 2; })
            .attr('width', bandWidth);
        // Transition
        rectsUpdate
            .transition()
            .duration(duration)
            .attr('y', function (d, i) { return yScaler(d[1]); })
            .attr('height', function (d, i) { return yScaler(d[0]) - yScaler(d[1]); });
        if (interval) {
            brush([r0, r1], rectsUpdate, function (d, i) { return xs[i]; });
        }
        // Rects Exit
        rects
            .exit()
            .transition()
            .duration(duration)
            .attr('y', height - margin.top)
            .attr('height', 0)
            .remove();
        /* RECTS END */
        // drawBrush
        this.renderBrush(selector, xScaler);
        return this;
    };
    HistPainter.defaultParams = {
        color: Painter_1.labelColor,
        duration: Painter_1.defaultDuration,
        mode: 'overlay',
        padding: 4,
        margin: { top: 5, bottom: 5, left: 5, right: 5 },
        height: 50,
        width: 100,
        opacity: 0.35,
    };
    return HistPainter;
}());
exports.default = HistPainter;
