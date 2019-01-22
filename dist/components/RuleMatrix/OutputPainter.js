"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var nt = require("../../service/num");
var Painters_1 = require("../Painters");
// import { registerStripePattern } from '../../service/utils';
var ruleModel_1 = require("../../models/ruleModel");
// Returns a tween for a transition’s "d" attribute, transitioning any selected
// arcs from their current angle to the specified new angle.
function arcTween(startAngle, newAngle, arc) {
    // The function passed to attrTween is invoked for each selected element when
    // the transition starts, and for each element returns the interpolator to use
    // over the course of transition. This function is thus responsible for
    // determining the starting angle of the transition (which is pulled from the
    // element’s bound datum, d.endAngle), and the ending angle (simply the
    // newAngle argument to the enclosing function).
    // return function() {
    // To interpolate between the two angles, we use the default d3.interpolate.
    // (Internally, this maps to d3.interpolateNumber, since both of the
    // arguments to d3.interpolate are numbers.) The returned function takes a
    // single argument t and returns a number between the starting angle and the
    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
    // newAngle; and for 0 < t < 1 it returns an angle in-between.
    var interpolate = d3.interpolate(startAngle, newAngle);
    // The return value of the attrTween is also a function: the function that
    // we want to run for each tick of the transition. Because we used
    // attrTween("d"), the return value of this last function will be set to the
    // "d" attribute at every tick. (It’s also possible to use transition.tween
    // to run arbitrary code for every tick, say if you want to set multiple
    // attributes from a single function.) The argument t ranges from 0, at the
    // start of the transition, to 1, at the end.
    return function (t) {
        // Calculate the current arc angle based on the transition time, t. Since
        // the t for the transition and the t for the interpolate both range from
        // 0 to 1, we can pass t directly to the interpolator.
        //
        // Note that the interpolated angle is written into the element’s bound
        // data object! This is important: it means that if the transition were
        // interrupted, the data bound to the element would still be consistent
        // with its appearance. Whenever we start a new arc transition, the
        // correct starting angle can be inferred from the data.
        // d.endAngle = interpolate(t);
        // Lastly, compute the arc path given the updated data! In effect, this
        // transition uses data-space interpolation: the data is interpolated
        // (that is, the end angle) rather than the path string itself.
        // Interpolating the angles in polar coordinates, rather than the raw path
        // string, produces valid intermediate arcs during the transition.
        return arc({ endAngle: interpolate(t) }) || '';
    };
    // };
}
function getPatternIds(color, keys) {
    return keys.map(function (key) { return "stripe-" + color(key).slice(1); });
}
var SupportPainter = /** @class */ (function () {
    function SupportPainter() {
    }
    SupportPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (SupportPainter.defaultParams), (this.params), params);
        return this;
    };
    SupportPainter.prototype.data = function (newData) {
        this.support = newData;
        return this;
    };
    SupportPainter.prototype.render = function (selector) {
        var support = this.support;
        if (nt.isMat(support)) {
            this.renderSimple(selector, []);
            this.renderMat(selector, support);
        }
        else {
            this.renderMat(selector, []);
            this.renderSimple(selector, support);
        }
        return this;
    };
    SupportPainter.prototype.renderSimple = function (selector, support) {
        var _a = this.params, duration = _a.duration, height = _a.height, widthFactor = _a.widthFactor, color = _a.color;
        var xs = tslib_1.__spread([0], (nt.cumsum(support)));
        // Render
        // Join
        var rects = selector.selectAll('rect.mo-support').data(support);
        // Enter
        var rectsEnter = rects.enter().append('rect').attr('class', 'mo-support')
            .attr('height', height);
        // Update
        var rectsUpdate = rectsEnter.merge(rects)
            .style('fill', function (d, i) { return color(i); });
        // Transition
        rectsUpdate.transition().duration(duration)
            .attr('width', function (d) { return d * widthFactor; })
            .attr('x', function (d, i) { return xs[i] * widthFactor + i * 1.5; })
            .attr('height', height);
        // Exit
        rects.exit().transition().duration(duration)
            .attr('width', 1e-6).remove();
        return this;
    };
    SupportPainter.prototype.renderMat = function (selector, support) {
        // Support is a confusion matrix
        // The (i, j) of support means the number of data with label i predicted as label j
        var _a = this.params, height = _a.height, widthFactor = _a.widthFactor, duration = _a.duration, color = _a.color;
        // const trueLabels = support.map((s: number[]) => nt.sum(s));
        var predictions = support.length ? nt.sumVec(support) : [];
        var truePredictions = support.map(function (s, i) { return s[i]; });
        var total = nt.sum(predictions);
        var falsePredictions = nt.minus(predictions, truePredictions);
        var width = total * widthFactor;
        var widths = predictions.map(function (l) { return l * widthFactor; });
        var xs = tslib_1.__spread([0], (nt.cumsum(widths)));
        // const ys = support.map((s, i) => s[i] / trueLabels[i] * height);
        // const heights = ys.map((y) => height - y);
        var acc = selector.selectAll('text.mo-acc')
            .data(total ? [nt.sum(truePredictions) / (total + 1e-6)] : []);
        var accUpdate = acc.enter().append('text')
            .attr('class', 'mo-acc')
            .attr('display', 'none')
            .merge(acc);
        accUpdate.attr('x', width + 5).attr('y', height / 2 + 5).text(function (d) { return "acc: " + d.toFixed(2); });
        selector.on('mouseover', function () {
            accUpdate.attr('display', null);
        }).on('mouseout', function () {
            accUpdate.attr('display', 'none');
        });
        // acc.exit().remove();
        // Render True Rects
        var trueData = support
            .map(function (s, i) { return ({ width: widths[i], x: xs[i], data: [truePredictions[i], falsePredictions[i]], label: i }); })
            .filter(function (v) { return v.width > 0; });
        // // Join
        // const rects = selector.selectAll('rect.mo-support-true')
        //   .data(trueData);
        // // Enter
        // const rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
        //   .attr('height', height);
        // // Update
        // const rectsUpdate = rectsEnter.merge(rects)
        //   .style('fill', d => color(d.label))
        //   .style('stroke', d => color(d.label));
        // // Transition
        // rectsUpdate.transition().duration(duration)
        //   .attr('width', d => d.width)
        //   .attr('x', (d, i) => d.x + i * 1.5)
        //   .attr('height', d => d.height);
        // // Exit
        // rects.exit().transition().duration(duration)
        //   .attr('width', 1e-6).remove();
        // Register the stripes
        var stripeNames = getPatternIds(color, d3.range(support.length));
        // Render the misclassified part using stripes
        var root = selector.selectAll('g.mo-support-mat')
            .data(trueData);
        // enter
        var rootEnter = root.enter().append('g')
            .attr('class', 'mo-support-mat');
        // update
        var rootUpdate = rootEnter.merge(root).style('stroke', function (d) { return color(d.label); });
        // update transition
        rootUpdate.transition().duration(duration)
            .attr('transform', function (d, i) { return "translate(" + (d.x + i * 1.5) + ",0)"; });
        // root exit
        var exitTransition = root.exit().transition().duration(duration).remove();
        exitTransition.selectAll('rect.mo-support-mat').attr('width', 1e-6).attr('x', 1e-6);
        // stripe rects
        var rects = rootUpdate.selectAll('rect.mo-support-mat')
            .data(function (d) {
            // const xs = [0, ...(nt.cumsum(d))];
            var base = nt.sum(d.data);
            var factor = base ? d.width / base : 0;
            var _widths = d.data.map(function (v) { return v * factor; });
            var _xs = tslib_1.__spread([0], nt.cumsum(_widths));
            // console.log(factor); // tslint:disable-line
            var ret = d.data.map(function (v, j) { return ({
                width: _widths[j], x: _xs[j], label: d.label,
                fill: j === 0 ? color(d.label) : "url(\"#" + stripeNames[d.label] + "\")"
            }); });
            return ret.filter(function (r) { return r.width > 0; });
        });
        var stripeEnter = rects.enter().append('rect')
            .attr('class', 'mo-support-mat').attr('height', function (d) { return height; });
        var stripeUpdate = stripeEnter.merge(rects)
            // .classed('striped', d => d.striped)
            // .style('stroke', d => color(d.label))
            // .style('display', d => d.striped ? 'inline' : 'none')
            .style('fill', function (d) { return d.fill; });
        stripeUpdate.transition().duration(duration)
            .attr('height', function (d) { return height; })
            .attr('width', function (d) { return d.width; }).attr('x', function (d) { return d.x; });
        rects.exit().transition().duration(duration)
            .attr('width', 1e-6).attr('x', 1e-6).remove();
        return this;
    };
    SupportPainter.prototype.renderMatBack = function (selector, support) {
        var _a = this.params, height = _a.height, widthFactor = _a.widthFactor, duration = _a.duration, color = _a.color;
        var trueLabels = support.map(function (s) { return nt.sum(s); });
        // const total = nt.sum(trueLabels);
        // const width = total * widthFactor;
        var widths = trueLabels.map(function (l) { return l * widthFactor; });
        var xs = tslib_1.__spread([0], (nt.cumsum(widths)));
        var ys = support.map(function (s, i) { return s[i] / trueLabels[i] * height; });
        // const heights = ys.map((y) => height - y);
        // Render True Rects
        var trueData = support
            .map(function (s, i) { return ({ width: widths[i], x: xs[i], height: ys[i], data: s, label: i }); })
            .filter(function (v) { return v.width > 0; });
        // Join
        var rects = selector.selectAll('rect.mo-support-true')
            .data(trueData);
        // Enter
        var rectsEnter = rects.enter().append('rect').attr('class', 'mo-support-true')
            .attr('height', height);
        // Update
        var rectsUpdate = rectsEnter.merge(rects)
            .style('fill', function (d) { return color(d.label); })
            .style('stroke', function (d) { return color(d.label); });
        // Transition
        rectsUpdate.transition().duration(duration)
            .attr('width', function (d) { return d.width; })
            .attr('x', function (d, i) { return d.x + i * 1.5; })
            .attr('height', function (d) { return d.height; });
        // Exit
        rects.exit().transition().duration(duration)
            .attr('width', 1e-6).remove();
        // Register the stripes
        var stripeNames = getPatternIds(color, d3.range(trueLabels.length));
        // Render the misclassified part using stripes
        var root = selector.selectAll('g.mo-support-mat')
            .data(trueData);
        // enter
        var rootEnter = root.enter().append('g')
            .attr('class', 'mo-support-mat');
        // update
        var rootUpdate = rootEnter.merge(root).style('stroke', function (d) { return color(d.label); });
        // update transition
        rootUpdate.transition().duration(duration)
            .attr('transform', function (d, i) { return "translate(" + (d.x + i * 1.5) + "," + d.height + ")"; });
        // root exit
        var exitTransition = root.exit().transition().duration(duration).remove();
        exitTransition.selectAll('rect.mo-support-mat').attr('width', 1e-6).attr('x', 1e-6);
        // stripe rects
        var stripeRects = rootUpdate.selectAll('rect.mo-support-mat')
            .data(function (d) {
            // const xs = [0, ...(nt.cumsum(d))];
            var base = nt.sum(d.data) - d.data[d.label];
            var factor = base ? d.width / base : 0;
            var _widths = d.data.map(function (v, j) { return j === d.label ? 0 : v * factor; });
            var _xs = tslib_1.__spread([0], nt.cumsum(_widths));
            // console.log(factor); // tslint:disable-line
            var ret = d.data.map(function (v, j) { return ({
                height: height - d.height,
                width: _widths[j], x: _xs[j], label: j
            }); });
            return ret.filter(function (r) { return r.width > 0; });
        });
        var stripeEnter = stripeRects.enter().append('rect')
            .attr('class', 'mo-support-mat').attr('height', function (d) { return d.height; });
        var stripeUpdate = stripeEnter.merge(stripeRects)
            // .classed('striped', d => d.striped)
            // .style('stroke', d => color(d.label))
            // .style('display', d => d.striped ? 'inline' : 'none')
            .style('fill', function (d) { return "url(#" + stripeNames[d.label] + ")"; });
        stripeUpdate.transition().duration(duration)
            .attr('height', function (d) { return d.height; })
            .attr('width', function (d) { return d.width; }).attr('x', function (d) { return d.x; });
        stripeRects.exit().transition().duration(duration)
            .attr('width', 1e-6).attr('x', 1e-6).remove();
        return this;
    };
    SupportPainter.defaultParams = {
        color: Painters_1.labelColor,
        duration: Painters_1.defaultDuration,
    };
    return SupportPainter;
}());
exports.SupportPainter = SupportPainter;
var OutputPainter = /** @class */ (function () {
    function OutputPainter() {
        this.params = tslib_1.__assign({}, (OutputPainter.defaultParams));
        this.supportPainter = new SupportPainter();
    }
    OutputPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (OutputPainter.defaultParams), (this.params), params);
        return this;
    };
    OutputPainter.prototype.data = function (newData) {
        this.rules = newData;
        return this;
    };
    OutputPainter.prototype.render = function (selector) {
        var duration = this.params.duration;
        var rules = this.rules;
        this.useMat = rules.length > 0 && nt.isMat(rules[0].support);
        // console.log('useMat', rules[0].support); // tslint:disable-line
        // console.log('useMat', this.useMat); // tslint:disable-line
        var collapseYs = new Map();
        rules.forEach(function (r) { return ruleModel_1.isRuleGroup(r) && r.rules.forEach(function (_r) { return collapseYs.set("o-" + _r.idx, r.y); }); });
        this.renderHeader(selector);
        // ROOT Group
        var groups = selector.selectAll('g.matrix-outputs')
            .data(rules, function (r) { return r ? "o-" + r.idx : this.id; });
        // Enter
        var groupsEnter = groups.enter()
            .append('g')
            .attr('class', 'matrix-outputs')
            .attr('id', function (d) { return "o-" + d.idx; })
            .attr('transform', function (d) { return d.parent ? "translate(10, " + (d.y - 40) + ")" : 'translate(10, 0)'; });
        // Update
        var groupsUpdate = groupsEnter.merge(groups)
            .classed('hidden', false).classed('visible', true);
        var updateTransition = groupsUpdate.transition().duration(duration)
            .attr('transform', function (d) { return "translate(10," + d.y + ")"; });
        this.renderOutputs(groupsEnter, groupsUpdate, updateTransition);
        this.renderFidelity(groupsEnter, groupsUpdate, updateTransition);
        this.renderSupports(groupsEnter, groupsUpdate);
        // Exit
        groups.exit()
            .classed('hidden', true).classed('visible', false)
            .transition().duration(duration)
            .attr('transform', function (d, i, nodes) {
            return "translate(10," + collapseYs.get(nodes[i].id) + ")";
        });
        return this;
    };
    OutputPainter.prototype.renderHeader = function (root) {
        // make sure the group exists
        // console.log('here'); // tslint:disable-line
        var _a = this.params, duration = _a.duration, displayEvidence = _a.displayEvidence, displayFidelity = _a.displayFidelity;
        var rules = this.rules;
        // const confidence = nt.sum(rules.map((r) => r.totalSupport * r.output[r.label])) / totalSupport;
        root.selectAll('g.mo-headers').data(['g']).enter()
            .append('g').attr('class', 'mo-headers').attr('transform', 'translate(0,-20)');
        var headerTexts = ['Output (Pr)', 'Evidence'];
        var headerXs = [15, 80];
        var fillRatios = [0, 0];
        var rectWidths = [80, 67];
        if (this.useMat) {
            var totalSupport = nt.sum(rules.map(function (r) { return r.totalSupport || 0; }));
            var fidelity = nt.sum(rules.map(function (r) { return r._support[r.label]; })) / totalSupport;
            var acc = nt.sum(rules.map(function (r) { return nt.isMat(r.support) ? nt.sum(r.support.map(function (s, i) { return s[i]; })) : 0; })) / totalSupport;
            headerTexts = ['Output (Pr)', "Fidelity (" + (fidelity * 100).toFixed(0) + "/100)",
                "Evidence (Acc: " + acc.toFixed(2) + ")"];
            headerXs = [15, 75, 125];
            rectWidths = [80, 110, 135];
            fillRatios = [0, fidelity, acc];
        }
        if (!displayEvidence && headerTexts.length === 3) {
            headerTexts = headerTexts.slice(0, 2);
            if (!displayFidelity) {
                headerTexts = headerTexts.slice(0, 1);
            }
        }
        else if (!displayFidelity) {
            headerTexts = headerTexts.slice(0, 1);
        }
        var headers = root.select('g.mo-headers');
        var header = headers.selectAll('g.mo-header').data(headerTexts);
        var headerEnter = header.enter().append('g').attr('class', 'mo-header')
            .attr('transform', function (d, i) { return "translate(" + headerXs[i] + ",0) rotate(-50)"; })
            .style('font-size', 14);
        // rects
        headerEnter.append('rect')
            .attr('class', 'mo-header-box')
            .style('stroke-width', 1).style('stroke', '#1890ff').style('fill', '#fff')
            .attr('width', function (d, i) { return rectWidths[i]; }).attr('height', 20)
            .attr('rx', 2).attr('ry', 2);
        // rects
        headerEnter.append('rect').attr('class', 'mo-header-fill')
            .style('stroke-width', 1).style('stroke', '#1890ff')
            .style('fill', '#1890ff').style('fill-opacity', 0.1)
            .attr('height', 20)
            .attr('rx', 2).attr('ry', 2);
        // texts
        headerEnter.append('text')
            .attr('class', 'mo-header-text')
            .attr('text-anchor', 'start')
            .attr('fill', '#1890ff')
            .attr('dx', 3).attr('dy', 15);
        // Update
        var headerUpdate = headerEnter.merge(header);
        headerUpdate.select('text.mo-header-text').text(function (d) { return d; });
        var transition = headerUpdate.transition().duration(duration)
            .attr('transform', function (d, i) { return "translate(" + headerXs[i] + ",0) rotate(-50)"; });
        transition.select('rect.mo-header-box').attr('width', function (d, i) { return rectWidths[i]; });
        transition.select('rect.mo-header-fill')
            .attr('width', function (d, i) { return fillRatios[i] * rectWidths[i]; });
        // textsEnter.merge(texts).text(d => d);
        return this;
    };
    OutputPainter.prototype.renderOutputs = function (enter, update, updateTransition) {
        var _a = this.params, fontSize = _a.fontSize, color = _a.color, duration = _a.duration;
        // const outputWidth = fontSize * 2;
        // *Output Texts*
        // Enter
        enter.append('text').attr('class', 'mo-output').attr('text-anchor', 'middle').attr('dx', 15);
        // Update
        update.select('text.mo-output')
            .attr('font-size', function (d) { return ruleModel_1.isRuleGroup(d) ? fontSize * 0.8 : fontSize; })
            .text(function (d) {
            return ruleModel_1.isRuleGroup(d) ? '' : (Math.round(d.output[d.label] * 100) / 100).toFixed(2);
        }); // confidence as text
        // Transition
        updateTransition.select('text.mo-output')
            .style('fill', function (d) {
            return color(d.label);
        }
        // d3.interpolateRgb.gamma(2.2)('#ccc', '#000')(d.output[d.label] * 2 - 1)
        // d3.interpolateRgb.gamma(2.2)('#ddd', color(d.label))(d.output[d.label] * 2 - 1)
        )
            .attr('dy', function (d) { return d.height / 2 + fontSize * 0.4; });
        // *Output Bars*
        var rectHeight = fontSize;
        enter.append('g').attr('class', 'mo-outputs');
        // Transition
        updateTransition.select('g.mo-outputs')
            .attr('transform', function (d) { return "translate(30," + (d.height / 2 - fontSize * 0.4) + ")"; });
        // Rects
        var rects = update.select('g.mo-outputs')
            .selectAll('rect')
            .data(function (d) {
            if (ruleModel_1.isRuleGroup(d))
                return [];
            var y = 0;
            return d.output.map(function (o) {
                var ret = { o: o, y: y };
                y += o * rectHeight;
                return ret;
            });
        });
        var rectsUpdate = rects.enter().append('rect')
            .merge(rects);
        rectsUpdate.attr('width', 3).style('fill', function (d, i) { return color(i); })
            .transition().duration(duration)
            .attr('height', function (d) { return d.o * rectHeight; })
            .attr('y', function (d) { return d.y; });
        rects.exit().transition().duration(duration)
            .style('fill-opacity', 1e-6).remove();
        enter.append('path').attr('class', 'mo-divider')
            .attr('stroke-width', 0.5)
            .attr('stroke', '#444')
            .attr('d', function (d) { return "M 60 0 V " + d.height; });
        update.select('path.mo-divider').attr('d', function (d) { return "M 50 0 V " + d.height; });
        return this;
    };
    OutputPainter.prototype.renderFidelity = function (enter, update, updateTransition) {
        var _a = this.params, duration = _a.duration, displayFidelity = _a.displayFidelity;
        if (!displayFidelity) {
            update.select('g.mo-fidelity').attr('display', 'none');
            return this;
        }
        var fontSize = 13;
        var innerRadius = fontSize * 0.9;
        // const outputWidth = fontSize * 2;
        var dx = 80;
        var arc = d3.arc().innerRadius(innerRadius).outerRadius(innerRadius + 2).startAngle(0);
        // *Output Texts*
        // Enter
        var enterGroup = enter.append('g').attr('class', 'mo-fidelity');
        enterGroup.append('text').attr('class', 'mo-fidelity').attr('text-anchor', 'middle');
        enterGroup.append('path').attr('class', 'mo-fidelity')
            .attr('angle', 1e-4)
            .attr('d', arc({ endAngle: 1e-4 }));
        // Update
        var updateGroup = update.select('g.mo-fidelity')
            .datum(function (d) {
            var fidelity = d.fidelity;
            var color = fidelity !== undefined
                ? (fidelity > 0.8 ? '#52c41a' : fidelity > 0.5 ? '#faad14' : '#f5222d') : null;
            var angle = (!ruleModel_1.isRuleGroup(d) && fidelity !== undefined) ? (Math.PI * fidelity * 2 - 1e-3) : 0;
            return tslib_1.__assign({}, d, { color: color, angle: angle });
        });
        updateGroup.select('text.mo-fidelity')
            .attr('font-size', function (d) { return ruleModel_1.isRuleGroup(d) ? fontSize * 0.8 : fontSize; })
            .attr('dy', fontSize * 0.4)
            // .attr('dx', dx)
            .text(function (d) {
            return (!ruleModel_1.isRuleGroup(d) && d.fidelity !== undefined) ? (Math.round(d.fidelity * 100)).toFixed(0) : '';
        })
            .style('fill', function (d) { return d.color; });
        // Join
        updateGroup.transition().duration(duration)
            .attr('transform', function (d) { return "translate(" + dx + ", " + d.height / 2 + ")"; })
            .select('path.mo-fidelity')
            // update pos
            .attrTween('d', function (d) {
            var angle = Number(d3.select(this).attr('angle'));
            return arcTween(angle, (!ruleModel_1.isRuleGroup(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0, arc);
        })
            // .attr('d', d => arc({endAngle: (!isRuleGroup(d) && d.fidelity) ? (Math.PI * d.fidelity * 2 - 1e-3) : 0}))
            .style('fill', function (d) { return d.color; })
            .attr('angle', function (d) { return d.angle; });
        // Enter + Merge
        // const pathsUpdate = paths.enter()
        //   .append('path').attr('d', d => arc({endAngle: 0}))
        //   .attr('class', 'mo-fidelity')
        //   .merge(paths);
        // // transition
        // pathsUpdate.transition().duration(duration)
        //   .attr('d', d => arc({endAngle: Math.PI * d * 2}));
        // paths.exit().transition().duration(duration)
        //   .style('fill-opacity', 1e-6).remove();
        return this;
    };
    OutputPainter.prototype.renderSupports = function (enter, update) {
        var _this = this;
        var _a = this.params, duration = _a.duration, fontSize = _a.fontSize, widthFactor = _a.widthFactor, color = _a.color, elemHeight = _a.elemHeight, displayEvidence = _a.displayEvidence;
        if (!displayEvidence) {
            update.select('g.mo-supports').attr('display', 'none');
            return this;
        }
        var useMat = this.useMat;
        // Enter
        enter.append('g').attr('class', 'mo-supports');
        // Update
        var supports = update.select('g.mo-supports');
        supports.transition().duration(duration)
            .attr('transform', function (_a) {
            var height = _a.height;
            var x = useMat ? (fontSize * 8) : (fontSize * 5);
            var y = (elemHeight && elemHeight < height) ? ((height - elemHeight) / 2) : 0;
            return "translate(" + x + "," + y + ")";
        });
        // const height = supports.each
        // supports
        supports.each(function (_a, i, nodes) {
            var support = _a.support, height = _a.height;
            return support && _this.supportPainter
                .update({ widthFactor: widthFactor, height: (elemHeight && elemHeight < height) ? elemHeight : height, color: color })
                .data(support)
                .render(d3.select(nodes[i]));
        });
        return this;
    };
    OutputPainter.defaultParams = {
        color: Painters_1.labelColor,
        duration: Painters_1.defaultDuration,
        fontSize: 14,
        widthFactor: 200,
        displayEvidence: true,
        displayFidelity: true,
    };
    return OutputPainter;
}());
exports.default = OutputPainter;
