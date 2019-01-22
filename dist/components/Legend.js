"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var d3 = require("d3");
var Painters_1 = require("./Painters");
require("./Legend.css");
var Legend = /** @class */ (function (_super) {
    tslib_1.__extends(Legend, _super);
    function Legend(props) {
        return _super.call(this, props) || this;
    }
    Legend.prototype.update = function () {
        var _a = this.props, labels = _a.labels, labelSize = _a.labelSize, fontSize = _a.fontSize, color = _a.color, duration = _a.duration;
        var delta = labelSize + 80;
        var selector = d3.select(this.ref);
        var label = selector.selectAll('g.rm-label').data(labels);
        // ENTER
        var labelEnter = label.enter().append('g').attr('class', 'rm-label');
        labelEnter.append('rect')
            // .attr('x', (d: string, i: number) => delta * i)
            .attr('y', -(fontSize + labelSize) / 2.2)
            .attr('width', labelSize)
            .attr('height', labelSize);
        labelEnter.append('text').attr('text-anchor', 'start').attr('x', labelSize * 1.3).style('font-size', fontSize);
        var labelUpdate = labelEnter.merge(label)
            .attr('fill', function (d, i) { return color(i); });
        labelUpdate.transition()
            .duration(duration)
            .attr('transform', function (d, i) { return "translate(" + (i * delta + 50) + ", " + fontSize * 1.2 + ")"; });
        labelUpdate.select('text').text(function (d) { return d; });
        label.exit()
            .transition()
            .duration(duration)
            .style('fill-opacity', 1e-6)
            .remove();
        // Striped Prediction Legends
        var predict = selector.selectAll('g.rm-predict').data(labels);
        // ENTER
        var predictEnter = predict.enter().append('g').attr('class', 'rm-predict');
        predictEnter.append('rect')
            // .attr('x', (d: string, i: number) => delta * i)
            .attr('y', -(fontSize + labelSize) / 2.2)
            .attr('width', labelSize)
            .attr('height', labelSize);
        var predictUpdate = predictEnter.merge(label)
            .attr('fill', function (d, i) { return "url(\"#stripe-" + color(i).slice(1) + "\")"; });
        predictUpdate.transition()
            .duration(duration)
            .attr('transform', function (d, i) {
            return "translate(" + (i * (labelSize * 1.5) + labels.length * delta + 50) + ", " + fontSize * 1.2 + ")";
        });
        var predictText = selector.selectAll('text.rm-predict')
            .data(['Wrong Predictions']);
        predictText.enter()
            .append('text').merge(predictText)
            .attr('text-anchor', 'start').attr('x', labels.length * labelSize * 1.5 + labels.length * delta + 50)
            .attr('y', fontSize * 1.2)
            .style('font-size', fontSize).text(function (d) { return d; });
        predict.exit()
            .transition()
            .duration(duration)
            .style('fill-opacity', 1e-6)
            .remove();
    };
    Legend.prototype.componentDidMount = function () {
        this.update();
    };
    Legend.prototype.componentDidUpdate = function () {
        this.update();
    };
    Legend.prototype.render = function () {
        var _this = this;
        return (React.createElement("g", { ref: function (ref) { return _this.ref = ref; }, className: "rm-labels", transform: this.props.transform },
            React.createElement("text", { textAnchor: "start", x: "0", y: "17", fontSize: "14" }, "Labels:")));
    };
    Legend.defaultProps = {
        labelSize: 12,
        fontSize: 14,
        color: Painters_1.labelColor,
        duration: 400,
        transform: '',
    };
    return Legend;
}(React.PureComponent));
exports.default = Legend;
