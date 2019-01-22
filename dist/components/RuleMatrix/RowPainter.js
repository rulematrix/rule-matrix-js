"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var Painters_1 = require("../Painters");
var Painters_2 = require("../Painters");
var nt = require("../../service/num");
var StreamPainter_1 = require("../Painters/StreamPainter");
var ruleModel_1 = require("../../models/ruleModel");
// type ConditionData = (d: any, i: number ) => ConditionX;
var ConditionPainter = /** @class */ (function () {
    function ConditionPainter() {
        this.histPainter = new Painters_2.HistPainter();
        this.streamPainter = new StreamPainter_1.default();
    }
    ConditionPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (this.params), params);
        return this;
    };
    ConditionPainter.prototype.data = function (newData) {
        // this.condition = newData;
        return this;
    };
    ConditionPainter.prototype.render = function (selector) {
        var _this = this;
        var _a = this.params, color = _a.color, duration = _a.duration;
        // Default BG Rect
        // const rects = selector.selectAll('rect.matrix-bg').data(c => ['data']);
        // rects.enter().append('rect').attr('class', 'matrix-bg');
        // rects.exit().transition().duration(duration).remove();
        selector.select('rect.matrix-bg')
            .classed('matrix-bg-active', function (c) { return Boolean(c.active); })
            .attr('display', null)
            .transition().duration(duration)
            .attr('width', function (c) { return c.width; }).attr('height', function (c) { return c.height; });
        // const text = selector.select('text.glyph-desc')
        //   .attr('text-anchor', 'middle').attr('font-size', 9);
        // text.transition().duration(duration)
        //   .attr('x', c => c.width / 2).attr('y', c => c.height - 2);
        // text.text(d => d.desc);
        // selector.selectAll('g.matrix-glyph').data(['g'])
        //   .enter().append('g').attr('class', 'matrix-glyph');
        // selector.selectAll('g.matrix-glyph-expand').data(['g'])
        //   .enter().append('g').attr('class', 'matrix-glyph-expand');
        selector.each(function (c, i, nodes) {
            // const maskId = `mask-${c.ruleIdx}-${c.feature}-${c.category}`;
            var stream = c.stream;
            var paddingOut = c.expanded ? 5 : 1;
            var margin = { top: paddingOut, bottom: paddingOut, left: 1, right: 1 };
            var params = { width: c.width, height: c.height, interval: c.interval, margin: margin };
            var base = c.range[1] - c.range[0];
            var root = d3.select(nodes[i]);
            // // Make sure two groups exists
            // root.selectAll('g.matrix-glyph').data(['g'])
            //   .enter().append('g').attr('class', 'matrix-glyph');
            // root.selectAll('g.matrix-glyph-expand').data(['g'])
            //   .enter().append('g').attr('class', 'matrix-glyph-expand');
            // Groups
            var expandGlyph = root.select('g.matrix-glyph-expand');
            var glyph = root.select('g.matrix-glyph');
            var inputValue = root.selectAll('rect.glyph-value').data(c.value ? [c.value] : []);
            var inputValueUpdate = inputValue.enter()
                .append('rect').attr('class', 'glyph-value').attr('width', 2).attr('y', 0)
                .style('fill-opacity', 0.5)
                .merge(inputValue);
            inputValueUpdate.attr('x', function (v) { return (1 + (c.width - 2) / base * (v - c.range[0])); })
                .attr('height', c.height)
                .style('fill', function (v) { return (c.interval[0] < v && v < c.interval[1]) ? '#52c41a' : '#f5222d'; })
                .style('stroke', 'none');
            inputValue.exit().remove();
            // console.log(c); // tslint:disable-line
            var xs = stream && stream.xs;
            var streamXs = xs;
            var yMax = stream && stream.yMax;
            var streamData = [];
            if (c.expanded && stream && !c.isCategorical && xs) {
                var endPadding = new Array(stream.stream[0].length).fill(0);
                streamData = tslib_1.__spread([endPadding], (stream.stream), [endPadding]);
                var step = xs[1] - xs[0];
                streamXs = tslib_1.__spread([xs[0] - step / 2], xs, [xs[xs.length - 1] + step / 2]);
            }
            _this.streamPainter
                .update(tslib_1.__assign({}, params, { xs: streamXs, yMax: yMax, color: color }))
                .data(streamData)
                .render(expandGlyph);
            var padding = 0;
            if (c.isCategorical && stream) {
                var nBars = stream.stream.length;
                padding = c.width / (2 * nBars);
            }
            _this.histPainter
                .update(tslib_1.__assign({ padding: padding }, params, { xs: xs, yMax: yMax }))
                .data(((!c.expanded || c.isCategorical) && stream) ? [stream.stream.map(function (s) { return nt.sum(s); })] : [])
                .render(glyph);
        });
        return this;
    };
    return ConditionPainter;
}());
exports.ConditionPainter = ConditionPainter;
var RuleRowPainter = /** @class */ (function () {
    // private rule: RuleX;
    function RuleRowPainter() {
        this.conditionPainter = new ConditionPainter();
    }
    RuleRowPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (RuleRowPainter.defaultParams), (this.params), params);
        return this;
    };
    RuleRowPainter.prototype.data = function (newData) {
        this.rule = newData;
        return this;
    };
    RuleRowPainter.prototype.render = function (selector) {
        var _a = this.params, duration = _a.duration, labelColor = _a.labelColor, onClick = _a.onClick, tooltip = _a.tooltip;
        var rule = this.rule;
        // Background Rectangle
        var bgRect = selector.selectAll('rect.matrix-bg').data([this.rule]);
        var bgRectUpdate = bgRect.enter()
            .append('rect').attr('class', 'matrix-bg').attr('width', 0).attr('height', 0)
            .merge(bgRect);
        bgRectUpdate.classed('matrix-bg-highlight', function (d) { return Boolean(d.highlight); });
        bgRectUpdate.transition().duration(duration)
            .attr('width', function (d) { return d.width; }).attr('height', function (d) { return d.height; });
        // Button Group
        this.renderButton(selector);
        /* CONDITIONS */
        // JOIN
        var conditions = selector.selectAll('g.matrix-condition')
            .data(ruleModel_1.isRuleGroup(rule) ? [] : rule.conditions);
        // ENTER
        var conditionsEnter = conditions.enter()
            .append('g').attr('class', 'matrix-condition')
            .attr('transform', function (c) { return "translate(" + c.x + ", 0)"; });
        conditionsEnter.append('rect').attr('class', 'matrix-bg');
        conditionsEnter.append('g').attr('class', 'matrix-glyph');
        conditionsEnter.append('g').attr('class', 'matrix-glyph-expand');
        // conditionsEnter.append('text').attr('class', 'glyph-desc');
        // UPDATE
        var conditionsUpdate = conditionsEnter.merge(conditions)
            .classed('hidden', false).classed('visible', true).attr('display', null);
        // conditionsUpdate.select('title').text(d => d.title);
        // Register listener to click for expanding
        if (onClick)
            conditionsUpdate.on('click', function (c) { return onClick(c.feature); });
        // Transition
        conditionsUpdate
            .transition().duration(duration)
            .attr('transform', function (c) { return "translate(" + c.x + ", 0)"; });
        this.conditionPainter.update({ color: labelColor, duration: duration })
            .render(conditionsUpdate);
        // conditionsUpdate.each((d: ConditionX, i, nodes) =>
        //   painter.data(d).render(d3.select(nodes[i]))
        // );
        // EXIT
        conditions.exit().classed('hidden', true)
            .transition().delay(300)
            .attr('display', 'none');
        // Add listeners to update tooltip
        if (tooltip) {
            var renderTooltip_1 = function (texts) {
                tooltip.attr('display', null);
                // texts
                var tspan = tooltip.select('text').selectAll('tspan').data(texts);
                var tspanUpdate = tspan
                    .enter().append('tspan').attr('x', 5).attr('dx', '0.1em').attr('dy', '1.2em')
                    .merge(tspan);
                tspanUpdate.text(function (t) { return t; });
                tspan.exit().remove();
                // rect-bg
                var textNode = tooltip.select('text').node();
                var bBox = textNode ? textNode.getBoundingClientRect() : null;
                // console.log(bBox);  // tslint:disable-line
                var width = bBox ? bBox.width : 50;
                var height = bBox ? bBox.height : 20;
                // const x = 4;
                // const y = 4;
                // const x = bBox ? bBox.left : 0;
                // const y = bBox ? bBox.top : 0;
                // const height = textNode ? textNode.clientHeight : 0;
                tooltip.select('rect').attr('width', width + 10).attr('height', height * 1.2)
                    .attr('y', 4 - height * 0.1).attr('x', 3);
            };
            var hideTooltip = function () { return tooltip.attr('display', 'none'); };
            conditionsUpdate.on('mouseover', function (d) { return renderTooltip_1([d.title]); })
                .on('mouseout', hideTooltip);
            bgRectUpdate.on('mouseover', function (d) { return renderTooltip_1(d.conditions.map(function (c) { return c.title; })); })
                .on('mouseout', hideTooltip);
        }
        else {
            conditionsUpdate.on('mouseover', null).on('mouseout', null);
        }
        return this;
    };
    RuleRowPainter.prototype.renderButton = function (selector) {
        var _a = this.params, duration = _a.duration, buttonSize = _a.buttonSize, onClickButton = _a.onClickButton;
        var rule = this.rule;
        // Enter
        var groupEnter = selector.selectAll('g.row-button').data(['rule']).enter()
            .append('g').attr('class', 'row-button');
        // Collapse Button Enter
        groupEnter.append('g').attr('class', 'collapse-button')
            .append('rect').attr('class', 'button-bg')
            .attr('height', buttonSize / 2).attr('y', -buttonSize / 4).attr('x', -2).attr('fill', 'white');
        // Rule Button Enter
        groupEnter.append('g').attr('class', 'rule-button')
            .append('text').attr('class', 'rule-no').attr('text-anchor', 'start').attr('dx', 2);
        var buttonRoot = selector.select('g.row-button');
        var collapseButton = buttonRoot.select('g.collapse-button');
        var ruleButton = buttonRoot.select('g.rule-button');
        if (!ruleModel_1.isRuleGroup(rule) && !rule.expanded) {
            collapseButton.attr('display', 'none').on('click', null);
            ruleButton.attr('display', null);
            ruleButton.select('text.rule-no').attr('dy', rule.height / 2 + 6).text(rule.idx + 1);
            // selector.on('mouseover.button', () => {
            // }).on('mouseout.button', () => {
            //   ruleButton.select('text.rule-no').text('');
            // });
        }
        else {
            ruleButton.attr('display', 'none').on('mouseover.button', null).on('mouseout.button', null);
            collapseButton.attr('display', null)
                .on('click', onClickButton);
            collapseButton.transition().duration(duration)
                .attr('transform', "translate(" + (rule.expanded ? -20 : 4) + "," + rule.height / 2 + ")");
            collapseButton.select('rect.button-bg').attr('width', 20);
            var rects = collapseButton.selectAll('rect.row-button')
                .data(ruleModel_1.isRuleGroup(rule) ? rule.rules : []);
            rects.exit().transition().duration(duration)
                .attr('fill-opacity', 1e-6).remove();
            if (ruleModel_1.isRuleGroup(rule)) {
                // const nNested = rule.rules.length;
                var height = 4;
                var width = 4;
                var step_1 = width + 3;
                // const height = Math.min(rule.height / (2 * nNested - 1), 2);
                var rectsEnter = rects.enter()
                    .append('rect').attr('class', 'row-button')
                    .attr('rx', 2).attr('ry', 2)
                    .attr('fill', '#bbb');
                rectsEnter
                    .transition().duration(duration)
                    .attr('x', function (d, i) { return buttonSize + 4 + i * step_1; }).attr('width', width)
                    .attr('y', -height / 2).attr('height', height);
                collapseButton.select('rect.button-bg').attr('width', 20 + rule.rules.length * step_1);
            }
            collapseButton.selectAll('path.row-button')
                .data(['path']).enter().append('path')
                .attr('class', 'row-button')
                .attr('stroke-width', 2).attr('stroke', '#bbb').attr('fill', 'none');
            collapseButton.select('path.row-button').transition().duration(duration)
                .attr('d', rule.expanded
                ? "M 0 " + buttonSize / 4 + " L " + buttonSize / 2 + " " + -buttonSize / 4 + " L " + buttonSize + " " + buttonSize / 4
                : "M 0 " + -buttonSize / 4 + " L " + buttonSize / 2 + " " + buttonSize / 4 + " L " + buttonSize + " " + -buttonSize / 4);
        }
    };
    RuleRowPainter.defaultParams = {
        labelColor: Painters_1.labelColor,
        duration: Painters_2.defaultDuration,
        buttonSize: 10,
        onClickButton: function () { return null; },
    };
    return RuleRowPainter;
}());
exports.default = RuleRowPainter;
