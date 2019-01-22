"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nt = require("../../service/num");
var Painters_1 = require("../Painters");
require("./FlowPainter.css");
var originPoint = { x: 0, y: 0 };
var curve = function (s, t) {
    if (s === void 0) { s = originPoint; }
    if (t === void 0) { t = originPoint; }
    var dy = t.y - s.y;
    var dx = t.x - s.x;
    var r = Math.min(Math.abs(dx), Math.abs(dy));
    if (Math.abs(dx) > Math.abs(dy))
        return "M" + s.x + "," + s.y + " A" + r + "," + r + " 0 0 0 " + (s.x + r) + " " + t.y + " H " + t.x;
    else
        return "M " + s.x + "," + s.y + " V " + (s.y - r) + " A" + r + "," + r + " 0 0 0 " + t.x + " " + t.y + " ";
};
var flowCurve = function (d) {
    if (d)
        return curve(d.s, d.t);
    return curve();
};
var FlowPainter = /** @class */ (function () {
    function FlowPainter() {
    }
    FlowPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, FlowPainter.defaultParams, this.params, params);
        return this;
    };
    FlowPainter.prototype.data = function (flows) {
        var _this = this;
        this.flows = flows;
        var nClasses = flows.length > 0 ? flows[0].support.length : 0;
        this.flowSums = flows.map(function (r) { return nt.sum(r.support); });
        var reserves = Array.from({ length: nClasses }, function (_, i) { return flows.map(function (flow) { return flow.support[i]; }); });
        reserves = reserves.map(function (reserve) { return nt.cumsum(reserve.reverse()).reverse(); });
        this.reserveSums = new Array(flows.length).fill(0);
        reserves.forEach(function (reserve) { return nt.add(_this.reserveSums, reserve, false); });
        // const multiplier = width / reserveSums[0];
        this.reserves = Array.from({ length: flows.length }, function (_, i) { return reserves.map(function (reserve) { return reserve[i]; }); });
        // console.log(this.reserves); // tslint:disable-line
        // console.log(this.reserveSums); // tslint:disable-line
        return this;
    };
    FlowPainter.prototype.render = function (selector) {
        // const {width} = this.params;
        // Make sure the root group exits
        // selector
        //   .selectAll('g.flows')
        //   .data(['flows'])
        //   .enter()
        //   .append('g')
        //   .attr('class', 'flows');
        // const rootGroup = selector.select<SVGGElement>('g.flows')
        //   .attr('transform', `translate(${-width}, 0)`);
        // Render Rects
        this.renderRects(selector);
        // Render Flows
        this.renderFlows(selector);
        return this;
    };
    FlowPainter.prototype.renderRects = function (root) {
        var _a = this.params, duration = _a.duration, height = _a.height, width = _a.width, dy = _a.dy, color = _a.color, divideHeight = _a.divideHeight;
        var _b = this, flows = _b.flows, reserves = _b.reserves, reserveSums = _b.reserveSums;
        // Compute pos
        var heights = flows.map(function (f, i) { return i > 0 ? f.y - flows[i - 1].y : height; });
        var multiplier = width / reserveSums[0];
        // JOIN
        var reserve = root.selectAll('g.v-reserves').data(flows);
        // ENTER
        var reserveEnter = reserve.enter().append('g').attr('class', 'v-reserves');
        reserveEnter.append('title');
        reserveEnter.append('rect').attr('class', 'v-divide')
            .attr('rx', 3).attr('ry', 3);
        // UPDATE
        var reserveUpdate = reserveEnter.merge(reserve)
            .classed('hidden', false).classed('visible', true);
        reserveUpdate.select('title').text(function (d, i) { return reserves[i].join('/'); });
        reserveUpdate.select('rect.v-divide')
            .attr('width', function (d, i) { return reserveSums[i] * multiplier + 4; }).attr('x', -2)
            .attr('y', function (d, i) { return heights[i] - divideHeight; })
            .attr('height', divideHeight);
        // Transition groups
        reserveUpdate.transition().duration(duration)
            .attr('transform', function (d, i) { return "translate(0," + ((d.y - heights[i] - dy) || 0) + ")"; });
        // EXIT
        reserve.exit()
            .classed('hidden', true).classed('visible', false)
            .transition().duration(duration)
            .attr('transform', function (d) { return "translate(0," + ((d.y - dy - 60) || 0) + ")"; });
        // *RECTS START*
        // JOIN RECT DATA
        // console.warn(reserves);
        var rects = reserveUpdate.selectAll('rect.v-reserve')
            .data(function (d, i) {
            var widths = reserves[i].map(function (r) { return r * multiplier; });
            var xs = tslib_1.__spread([0], (nt.cumsum(widths.slice(0, -1))));
            return d.support.map(function (s, j) {
                return {
                    width: widths[j], height: heights[i] - divideHeight, x: xs[j]
                };
            });
        });
        // RECT ENTER
        var rectsEnter = rects.enter()
            .append('rect').attr('class', 'v-reserve')
            .attr('width', function (d) { return d.width; });
        // RECT UPDATE
        var rectsUpdate = rectsEnter.merge(rects)
            .style('fill', function (d, i) { return color(i); });
        rectsUpdate.transition().duration(duration)
            .attr('width', function (d) { return d.width; }).attr('height', function (d) { return d.height; }).attr('x', function (d) { return d.x; });
        // RECT EXIT
        rects.exit().remove();
        // *RECTS END*
        return this;
    };
    FlowPainter.prototype.renderFlows = function (root) {
        var _a = this.params, duration = _a.duration, width = _a.width, dy = _a.dy, dx = _a.dx, color = _a.color;
        var _b = this, flows = _b.flows, reserves = _b.reserves, reserveSums = _b.reserveSums, flowSums = _b.flowSums;
        // Compute pos
        // const heights = flows.map((f, i) => i > 0 ? f.y - flows[i - 1].y : height);
        var multiplier = width / reserveSums[0];
        // JOIN
        var flow = root.selectAll('g.v-flows').data(flows);
        // ENTER
        var flowEnter = flow.enter().append('g').attr('class', 'v-flows');
        flowEnter.append('title');
        // UPDATE
        var flowUpdate = flowEnter.merge(flow)
            .classed('hidden', false).classed('visible', true);
        flowUpdate.select('title').text(function (d) { return d.support.join('/'); });
        // Transition groups
        flowUpdate.transition().duration(duration)
            .attr('transform', function (d, i) { return "translate(0," + (d.y || 0) + ")"; });
        // EXIT
        flow.exit()
            .classed('hidden', true).classed('visible', false)
            .transition().duration(duration)
            .attr('transform', function (d) { return "translate(0," + ((d.y - dy - 60) || 0) + ")"; });
        // *PATHS START*
        // JOIN PATH DATA
        var paths = flowUpdate.selectAll('path')
            .data(function (d, i) {
            var x0 = ((i === reserves.length - 1) ? 0 : reserveSums[i + 1]) * multiplier;
            var y1 = flowSums[i] * multiplier / 2;
            return flows[i].support.map(function (f) {
                var pathWidth = f * multiplier;
                var s = { x: x0 + pathWidth / 2, y: -dy };
                var t = { x: dx + width, y: y1 - pathWidth / 2 };
                x0 += pathWidth;
                y1 -= pathWidth;
                return { s: s, t: t, width: pathWidth };
            });
        });
        // PATH ENTER
        var pathsEnter = paths.enter()
            .append('path')
            .attr('d', flowCurve())
            .style('stroke-width', 1e-6);
        // PATH UPDATE
        var pathsUpdate = pathsEnter.merge(paths)
            .style('stroke', function (d, i) { return color(i); });
        pathsUpdate.transition().duration(duration)
            .attr('d', flowCurve)
            .style('stroke-width', function (d) { return d.width + "px"; });
        // PATH EXIT
        paths.exit().transition().duration(duration)
            .attr('d', flowCurve()).style('stroke-width', 1e-6)
            .remove();
        // *PATHS END*
        return this;
    };
    FlowPainter.defaultParams = {
        width: 100,
        height: 50,
        duration: Painters_1.defaultDuration,
        dy: -30,
        dx: -40,
        color: Painters_1.labelColor,
        divideHeight: 8,
    };
    return FlowPainter;
}());
exports.default = FlowPainter;
