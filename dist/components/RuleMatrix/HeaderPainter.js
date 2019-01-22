"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var Painters_1 = require("../Painters");
var HeaderPainter = /** @class */ (function () {
    function HeaderPainter() {
        this.params = tslib_1.__assign({}, (HeaderPainter.defaultParams));
    }
    HeaderPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (HeaderPainter.defaultParams), (this.params), params);
        return this;
    };
    HeaderPainter.prototype.data = function (newData) {
        this.features = newData;
        return this;
    };
    HeaderPainter.prototype.render = function (selector) {
        var _a = this.params, duration = _a.duration, headerSize = _a.headerSize, rotate = _a.rotate, margin = _a.margin, maxHeight = _a.maxHeight, onClick = _a.onClick;
        var maxCount = d3.max(this.features, function (f) { return f.count; });
        var multiplier = maxHeight / (maxCount || 5);
        /* TEXT GROUP */
        var textG = selector.selectAll('g.header').data(this.features);
        // ENTER
        var textGEnter = textG.enter().append('g').attr('class', 'header')
            .attr('transform', function (d) { return "translate(" + (d.x + d.width / 2) + "," + -10 + ") rotate(" + rotate + ")"; });
        // Append rects
        textGEnter.append('rect').attr('class', 'header-bg')
            .attr('rx', 1).attr('ry', 1)
            .attr('height', headerSize * 1.3).attr('x', -2).attr('y', -headerSize);
        // Append texts
        textGEnter.append('text').attr('class', 'header-text').attr('text-anchor', 'start');
        // UPDATE
        var textGUpdate = textGEnter.merge(textG)
            .on('click', (onClick ? (function (d) { return onClick(d.feature); }) : null));
        textGUpdate.select('text.header-text').style('font-size', headerSize)
            .classed('header-expanded', function (d) { return Boolean(d.expanded); })
            .text(function (d) { return d.text + " (" + d.count + ")"; });
        // TRANSITION
        var updateTransition = textGUpdate.transition().duration(duration)
            .attr('transform', function (d) {
            return "translate(" + (d.x + d.width / 2) + "," + (d.expanded ? -40 : -10) + ") rotate(" + rotate + ")";
        });
        // Text transition
        updateTransition.select('text.header-text')
            .style('font-size', headerSize);
        // Rect transition
        updateTransition.select('rect.header-bg')
            .attr('height', headerSize * 1.3).attr('width', function (d) { return d.count * multiplier; })
            .attr('y', -headerSize);
        // EXIT
        textG.exit().transition().duration(duration)
            .attr('transform', "translate(0,-10) rotate(" + rotate + ")").remove();
        /*AXIS*/
        var expandedFeatures = this.features.filter(function (f) { return f.expanded; });
        var axis = selector.selectAll('g.header-axis').data(expandedFeatures);
        // Enter + Merge
        var axisUpdate = axis.enter()
            .append('g').attr('class', 'header-axis')
            .merge(axis)
            .attr('transform', function (d) { return "translate(" + d.x + ", -5)"; });
        axisUpdate.each(function (d, i, nodes) {
            if (d.expanded) {
                var featureAxis = null;
                if (d.range && d.cutPoints) {
                    var ticks = tslib_1.__spread([d.range[0]], (d.cutPoints), [d.range[1]]);
                    var scale = d3.scaleLinear().domain(d.range).range([margin.left, d.width - margin.right]);
                    featureAxis = d3.axisTop(scale).tickValues(ticks).tickSize(2);
                }
                if (d.categories) {
                    var scale = d3.scalePoint().domain(d.categories).range([margin.left, d.width - margin.right]);
                    featureAxis = d3.axisTop(scale).tickValues(d.categories).tickSize(2);
                }
                if (featureAxis)
                    d3.select(nodes[i]).call(featureAxis)
                        .selectAll('text').style('text-anchor', 'start')
                        .attr('dx', '.4em')
                        .attr('dy', '.5em')
                        .attr('transform', 'rotate(-50)');
            }
        });
        axis.exit().remove();
        return this;
    };
    HeaderPainter.defaultParams = {
        duration: Painters_1.defaultDuration,
        rotate: -50,
        headerSize: 13,
        margin: { left: 1, right: 1 },
        maxHeight: 80,
    };
    return HeaderPainter;
}());
exports.default = HeaderPainter;
