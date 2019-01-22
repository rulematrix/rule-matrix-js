"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var Painter_1 = require("./Painter");
require("./index.css");
var AreaPainter = /** @class */ (function () {
    function AreaPainter() {
        this.params = tslib_1.__assign({}, (AreaPainter.defaultParams));
    }
    AreaPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (AreaPainter.defaultParams), (this.params), params);
        return this;
    };
    AreaPainter.prototype.data = function (hists) {
        this.hists = hists;
        return this;
    };
    AreaPainter.prototype.render = function (selector) {
        var _a = this.params, width = _a.width, height = _a.height, color = _a.color, hasAxis = _a.hasAxis;
        var hists = this.hists;
        var binSizes = 1;
        var lineDataList = this.hists.map(function (hist) {
            return hist.map(function (count, i) {
                return [i, count];
            });
        });
        var xMin = Math.min.apply(Math, tslib_1.__spread((lineDataList.map(function (line, i) { return line[0][0] - binSizes[i]; }))));
        var xMax = Math.max.apply(Math, tslib_1.__spread((lineDataList.map(function (line, i) { return line[line.length - 1][0] + binSizes[i]; }))));
        // console.log(lineDataList); // tslint:disable-line
        // console.log(xMin); // tslint:disable-line
        // console.log(xMax); // tslint:disable-line
        var xScale = d3
            .scaleLinear()
            .domain([xMin, xMax]) // input
            .range([1, width - 1]); // output
        var yScale = d3
            .scaleLinear()
            .domain([0, Math.max.apply(Math, tslib_1.__spread(hists.map(function (hist) { return Math.max.apply(Math, tslib_1.__spread(hist)); })))]) // input
            .range([height, 0]); // output
        var lineGenerator = d3
            .line()
            .x(function (d) { return xScale(d[0]); })
            .y(function (d) { return yScale(d[1]); })
            .curve(d3.curveNatural);
        // .curve(d3.curveCardinal.tension(tension));
        // const lineStrings = lineDataList.map(lineData => line(lineData));
        var areaGenerator = d3
            .area()
            .x(function (d) { return xScale(d[0]); })
            .y1(function (d) { return yScale(d[1]); })
            .y0(yScale(0))
            .curve(d3.curveNatural);
        // const areaStrings = lineDataList.map(lineData => area(lineData));
        var lines = selector.selectAll('.feature-dist')
            .data(lineDataList);
        var enterLines = lines.enter()
            .append('path')
            .attr('class', 'feature-dist')
            .style('stroke', function (d, i) { return color(i); });
        enterLines.merge(lines)
            .attr('d', lineGenerator);
        lines.exit()
            .transition()
            .duration(300)
            .style('stroke-opacity', 1e-6)
            .remove();
        var areas = selector.selectAll('.feature-dist-area')
            .data(lineDataList);
        var enterAreas = areas.enter()
            .append('path')
            .classed('feature-dist-area', true)
            .style('fill', function (d, i) { return color(i); });
        enterAreas.merge(areas)
            .attr('d', areaGenerator);
        areas.exit()
            .transition()
            .duration(300)
            .style('fill-opacity', 1e-6)
            .remove();
        var axis = selector.selectAll('g')
            .data(hasAxis ? ['x-axis', 'y-axis'] : []);
        axis
            .enter().append('g').attr('class', function (d) { return d; });
        selector.select('g.x-axis')
            .attr('transform', "translate(0," + yScale(0) + ")")
            .call(d3
            .axisBottom(xScale)
            .ticks(5)
            .tickSize(3));
        selector.select('g.y-axis')
            .attr('transform', "translate(0,0)")
            .call(d3
            .axisLeft(yScale)
            .ticks(2)
            .tickSize(3));
        axis.exit().remove();
        return this;
    };
    AreaPainter.defaultParams = {
        width: 100,
        height: 50,
        color: Painter_1.defaultColor,
        hasAxis: false,
    };
    return AreaPainter;
}());
exports.AreaPainter = AreaPainter;
