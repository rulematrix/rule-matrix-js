"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var d3 = require("d3");
var Painters_1 = require("../Painters");
var nt = require("../../service/num");
var models_1 = require("../../models");
var RowPainter_1 = require("./RowPainter");
var models_2 = require("../../models");
var FlowPainter_1 = require("./FlowPainter");
var OutputPainter_1 = require("./OutputPainter");
var HeaderPainter_1 = require("./HeaderPainter");
function flattenRules(rules) {
    var ret = [];
    rules.forEach(function (r) {
        ret.push(r);
        if (models_1.isRuleGroup(r))
            ret.push.apply(ret, tslib_1.__spread((r.rules.slice(1))));
    });
    return ret;
}
exports.flattenRules = flattenRules;
function computeExistingFeatures(rules, nFeatures) {
    var featureCounts = new Array(nFeatures).fill(0);
    for (var i = 0; i < rules.length - 1; ++i) {
        if (models_1.isRuleGroup(rules[i]))
            continue; // do not display the these features
        var conditions = rules[i].conditions;
        for (var j = 0; j < conditions.length; ++j) {
            featureCounts[conditions[j].feature] += 1;
        }
    }
    var sortedIdx = models_1.rankRuleFeatures(rules, nFeatures);
    var features = sortedIdx.filter(function (f) { return featureCounts[f] > 0; });
    return { features: features, featureCounts: featureCounts };
}
/**
 * Convert the rules of Rule type to RuleX type (used for presentation only)
 */
function initRuleXs(rules, model) {
    return rules.map(function (r, i) {
        var conditions = r.conditions, _support = r._support, rest = tslib_1.__rest(r, ["conditions", "_support"]);
        var conditionXs = [];
        // if (i !== rules.length - 1) 
        var conditionsFiltered = conditions.filter(function (c) { return c.feature >= 0; });
        conditionXs = conditionsFiltered.map(function (c) { return (tslib_1.__assign({}, c, { ruleIdx: r.idx, desc: model.categoryMathDesc(c.feature, c.category), title: model.categoryDescription(c.feature, c.category), x: 0, width: 0, height: 0, interval: model.categoryInterval(c.feature, c.category), expanded: false, range: model.meta.ranges[c.feature], 
            // histRange: model.categoryHistRange(c.feature, c.category),
            isCategorical: model.meta.isCategorical[c.feature] })); });
        var _supportNew = _support ? _support : model.meta.labelNames.map(function () { return 0; });
        return tslib_1.__assign({}, rest, { conditions: conditionXs, height: 0, x: 0, y: 0, width: 0, expanded: false, _support: _supportNew });
    });
}
var RuleMatrixPainter = /** @class */ (function () {
    function RuleMatrixPainter() {
        this.expandedElements = new Set();
        this.activeFeatures = new Set();
        this.rowPainter = new RowPainter_1.default();
        this.flowPainter = new FlowPainter_1.default();
        this.outputPainter = new OutputPainter_1.default();
        this.headerPainter = new HeaderPainter_1.default();
        this.collapseAll = this.collapseAll.bind(this);
        this.clickExpand = this.clickExpand.bind(this);
        this.clickFeature = this.clickFeature.bind(this);
        this.clickCondition = this.clickCondition.bind(this);
    }
    RuleMatrixPainter.prototype.feature2Idx = function (f) {
        return this.f2Idx[f];
    };
    RuleMatrixPainter.prototype.update = function (params) {
        this.params = tslib_1.__assign({}, (RuleMatrixPainter.defaultParams), (this.params), params);
        return this;
    };
    RuleMatrixPainter.prototype.collapseAll = function () {
        if (this.expandedElements.size) {
            this.expandedElements.clear();
            this.render(this.selector);
        }
    };
    RuleMatrixPainter.prototype.clickExpand = function (r) {
        var rules = this.rules;
        var rule = rules[r];
        // Clicking on the button of a group to expand
        if (models_1.isRuleGroup(rule)) {
            // console.log(`Expand rule group ${r}`); // tslint:disable-line
            var nested = initRuleXs(rule.rules, this.model);
            nested[0].expanded = true; // this flag is used for drawing the button
            this.rules = tslib_1.__spread(rules.slice(0, r), nested, rules.slice(r + 1));
        }
        else {
            // Clicking on the button to collapse
            var i = r + 1;
            var nested = [rule];
            while (i < rules.length && rules[i].parent === rule.parent) {
                nested.push(rules[i]);
                i++;
            }
            // console.log(`Collapse rules [${r}, ${i})`); // tslint:disable-line
            var grouped = initRuleXs([models_1.groupRules(nested)], this.model);
            this.rules = tslib_1.__spread(rules.slice(0, r), grouped, rules.slice(i));
        }
        this.render(this.selector);
    };
    RuleMatrixPainter.prototype.clickCondition = function (r, f) {
        var key = r + "," + f;
        // console.log(`clicked ${key}`); // tslint:disable-line
        if (this.expandedElements.has(key)) {
            this.expandedElements.delete(key);
        }
        else {
            this.expandedElements.add(key);
        }
        this.render(this.selector);
    };
    RuleMatrixPainter.prototype.clickFeature = function (f) {
        if (this.activeFeatures.has(f)) {
            this.activeFeatures.delete(f);
            this.clickCondition(-1, f);
        }
        else {
            this.activeFeatures.add(f);
            this.clickCondition(-1, f);
        }
        // this.render(this.selector);
    };
    RuleMatrixPainter.prototype.updateRules = function () {
        var _a = this.params, model = _a.model, minSupport = _a.minSupport, minFidelity = _a.minFidelity, support = _a.support;
        if (this.model !== model || this.minSupport !== minSupport
            || this.support !== support || this.minFidelity !== minFidelity) {
            // console.log(minFidelity);  //tslint:disable-line
            // console.log(this.rules); //tslint:disable-line
            // console.log('Updating Rules'); // tslint:disable-line
            var rules = model.getRules();
            var nFeatures = model.nFeatures;
            // Filter rules by grouping
            var supportSum_1 = nt.sum(rules.map(function (r) { return r.totalSupport || 0; }));
            var groupedRules = models_1.groupRulesBy(rules, function (rule) {
                return (rule.totalSupport === undefined ? true : (rule.totalSupport >= (minSupport * supportSum_1)))
                    && (rule.fidelity === undefined ? true : rule.fidelity >= minFidelity);
            });
            // const groupedRules = groupBySupport(rules, minSupport * supportSum);
            this.rules = initRuleXs(groupedRules, model);
            // compute feature Mapping
            var _b = computeExistingFeatures(this.rules, nFeatures), features = _b.features, featureCounts = _b.featureCounts;
            var f2Idx_1 = new Array(nFeatures).fill(-1);
            features.forEach(function (f, i) { return f2Idx_1[f] = i; });
            this.features = features;
            this.featureCounts = featureCounts;
            this.f2Idx = f2Idx_1;
        }
        this.support = support;
        this.minSupport = minSupport;
        this.minFidelity = minFidelity;
        this.model = model;
        return this;
    };
    RuleMatrixPainter.prototype.updatePresentation = function () {
        var _a = this.params, expandFactor = _a.expandFactor, elemWidth = _a.elemWidth, elemHeight = _a.elemHeight, paddingX = _a.paddingX, paddingY = _a.paddingY, paddingLeft = _a.paddingLeft;
        // compute active sets
        var expandedRules = new Set();
        var expandedFeatures = new Set();
        this.expandedElements.forEach(function (s) {
            var rf = s.split(',');
            expandedRules.add(Number(rf[0]));
            expandedFeatures.add(Number(rf[1]));
        });
        // compute the widths and heights
        var expandWidth = elemWidth * expandFactor[0];
        var expandHeight = elemHeight * expandFactor[1];
        var groupedHeight = Math.min(elemHeight, Math.max(elemHeight / 2, 10) - 2);
        var padX = paddingX * elemWidth;
        var padY = paddingY * elemHeight;
        var padLeft = paddingLeft * elemWidth;
        var featureWidths = this.features.map(function (f) { return (expandedFeatures.has(f) ? expandWidth : elemWidth); });
        var ruleHeights = this.rules.map(function (r, i) {
            return (expandedRules.has(i) ? expandHeight : (models_1.isRuleGroup(r) ? groupedHeight : elemHeight));
        });
        var ys = ruleHeights.map(function (h) { return h + padY; });
        ys = tslib_1.__spread([0], (nt.cumsum(ys.slice(0, -1))));
        var xs = tslib_1.__spread([padLeft], (featureWidths.map(function (w) { return w + padX; })));
        xs = nt.cumsum(xs.slice(0, -1));
        this.xs = xs;
        this.ys = ys;
        this.widths = featureWidths;
        this.heights = ruleHeights;
        // this.activeRules = activeRules;
        this.expandedFeatures = expandedFeatures;
        return this;
    };
    RuleMatrixPainter.prototype.updatePos = function () {
        var _this = this;
        var _a = this.params, streams = _a.streams, input = _a.input;
        var _b = this, xs = _b.xs, ys = _b.ys, widths = _b.widths, heights = _b.heights, expandedElements = _b.expandedElements, activeFeatures = _b.activeFeatures, model = _b.model;
        var width = xs[xs.length - 1] + widths[widths.length - 1];
        var lastIdx = input ? model.predict(input) : -1;
        // const support = model.getSupportOrSupportMat();
        // console.log(lastIdx); // tslint:disable-line
        // update ruleX positions
        this.rules.forEach(function (r, i) {
            r.y = ys[i];
            r.height = heights[i];
            r.width = models_1.isRuleGroup(r) ? width - 10 : width; // isRuleGroup(r) ? (width - 10) : width;
            r.x = models_1.isRuleGroup(r) ? 10 : 0;
            r.highlight = i === lastIdx;
            // r.support = support[i];
        });
        // update conditionX positions
        this.rules.forEach(function (r, i) {
            r.conditions.forEach(function (c) {
                if (c.feature !== -1) {
                    c.x = xs[_this.feature2Idx(c.feature)];
                    c.width = widths[_this.feature2Idx(c.feature)];
                    c.height = heights[i];
                    c.expanded = expandedElements.has(i + "," + c.feature);
                    c.active = activeFeatures.has(c.feature);
                    c.value = (i <= lastIdx && input) ? input[c.feature] : undefined;
                }
                if (streams) {
                    if (models_2.isConditionalStreams(streams))
                        c.stream = streams[i][c.feature];
                    else
                        c.stream = streams[c.feature];
                }
            });
        });
        return this;
    };
    RuleMatrixPainter.prototype.render = function (selector) {
        var _a = this.params, x0 = _a.x0, y0 = _a.y0;
        this.selector = selector;
        this.updateRules().updatePresentation().updatePos();
        // Global Transform
        selector.attr('transform', "translate(" + x0 + ", " + y0 + ")");
        // selector.selectAll('rect.bg').data(['rect-bg']).enter()
        //   .append('rect').attr('class', 'bg');
        // Root Container
        selector.selectAll('g.container').data(['container']).enter()
            .append('g').attr('class', 'container');
        var container = selector.select('g.container');
        // Rule Root
        container.selectAll('g.rules').data(['rules']).enter()
            .append('g').attr('class', 'rules');
        var ruleRoot = container.select('g.rules');
        // Flow Root
        container.selectAll('g.flows').data(['flows']).enter()
            .append('g').attr('class', 'flows');
        var flowRoot = container.select('g.flows');
        // Header Root
        container.selectAll('g.headers').data(['headers']).enter()
            .append('g').attr('class', 'headers');
        var headerRoot = container.select('g.headers');
        // Output
        container.selectAll('g.outputs').data(['outputs']).enter()
            .append('g').attr('class', 'outputs');
        var outputRoot = container.select('g.outputs');
        // CursorFollow
        container.selectAll('g.cursor-follow').data(['cursor-follow']).enter()
            .append('g').attr('class', 'cursor-follow');
        var cursorFollow = container.select('g.cursor-follow');
        // Render cursorFollow first, because the we need to register tooltip to rowPainter
        this.renderCursorFollow(container, cursorFollow);
        this.renderRows(ruleRoot);
        this.renderFlows(flowRoot);
        this.renderHeader(headerRoot);
        this.renderOutputs(outputRoot);
        // Button
        selector.selectAll('g.buttons').data(['buttons']).enter()
            .append('g').attr('class', 'buttons');
        var buttons = selector.select('g.buttons');
        this.renderButton(buttons);
        this.registerZoom(selector, container);
        // selector.select('rect.bg')
        //   .attr('width', this.getWidth() + 400)
        //   .attr('height', this.getHeight() + 400)
        //   .attr('fill', 'white')
        //   .attr('fill-opacity', 1e-6);
        return this;
    };
    RuleMatrixPainter.prototype.renderRows = function (root) {
        var _this = this;
        var _a = this.params, duration = _a.duration, flowWidth = _a.flowWidth, color = _a.color;
        var rules = this.rules;
        var collapseYs = new Map();
        rules.forEach(function (r) { return models_1.isRuleGroup(r) && r.rules.forEach(function (_r) { return collapseYs.set("r-" + _r.idx, r.y); }); });
        // const flatRules = flattenRules(rules);
        root.attr('transform', "translate(" + (flowWidth * 2 + 10) + ",0)");
        // Joined
        var rule = root
            .selectAll('g.matrix-rule')
            .data(this.rules, function (r, i) {
            return (r ? "r-" + r.idx : this.getAttribute('data-id')) || String(i);
        });
        // Enter
        var ruleEnter = rule.enter().append('g').attr('data-id', function (d) { return "r-" + d.idx; })
            .attr('class', 'matrix-rule')
            .attr('transform', function (d) { return d.parent ? "translate(" + d.x + "," + (d.y - 40) + ")" : 'translate(0,0)'; });
        // Update
        var ruleUpdate = ruleEnter.merge(rule)
            .attr('display', null).classed('hidden', false).classed('visible', true);
        ruleUpdate
            .transition()
            .duration(duration)
            .attr('transform', function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        // Exit
        rule.exit()
            .classed('visible', false)
            .classed('hidden', true)
            .transition()
            .duration(duration)
            .attr('transform', function (d, i, nodes) {
            return "translate(0," + (collapseYs.get(nodes[i].id) || 0) + ")";
        }).transition().delay(300)
            .attr('display', 'none');
        var painter = this.rowPainter;
        ruleUpdate.each(function (d, i, nodes) {
            // if (i === this.rules.length - 1) return;
            painter.data(d)
                .update({
                labelColor: color,
                // feature2Idx: this.feature2Idx, 
                onClick: function (f) { return _this.clickCondition(i, f); },
                onClickButton: function () { return _this.clickExpand(i); },
            })
                .render(d3.select(nodes[i]));
        });
        return this;
    };
    RuleMatrixPainter.prototype.renderOutputs = function (root) {
        var _a = this.params, evidenceWidth = _a.evidenceWidth, duration = _a.duration, color = _a.color, flowWidth = _a.flowWidth, elemHeight = _a.elemHeight, displayEvidence = _a.displayEvidence, displayFidelity = _a.displayFidelity;
        var widthFactor = evidenceWidth / this.model.maxSupport;
        var width = this.getWidth();
        root.transition().duration(duration)
            .attr('transform', "translate(" + (width + flowWidth * 2 + 10) + ",0)");
        this.outputPainter.update({ widthFactor: widthFactor, duration: duration, color: color, elemHeight: elemHeight, displayEvidence: displayEvidence, displayFidelity: displayFidelity })
            .data(this.rules).render(root);
        return this;
    };
    RuleMatrixPainter.prototype.renderFlows = function (root) {
        var _a = this.params, flowWidth = _a.flowWidth, color = _a.color, displayFlow = _a.displayFlow;
        if (!displayFlow) {
            root.remove();
            return this;
        }
        var rules = this.rules;
        var dx = flowWidth + 10; // Math.max(50, flowWidth + 10);
        var flows = rules.map(function (_a) {
            var _support = _a._support, y = _a.y, height = _a.height;
            return ({
                support: _support, y: y + height / 2
            });
        });
        this.flowPainter.update({ dx: dx, dy: flowWidth, width: flowWidth, color: color })
            .data(flows).render(root);
        return this;
    };
    RuleMatrixPainter.prototype.renderHeader = function (root) {
        var _a = this.params, duration = _a.duration, headerSize = _a.headerSize, headerRotate = _a.headerRotate, flowWidth = _a.flowWidth;
        var _b = this, xs = _b.xs, widths = _b.widths, features = _b.features, expandedFeatures = _b.expandedFeatures, featureCounts = _b.featureCounts, model = _b.model;
        root.attr('transform', "translate(" + (flowWidth * 2 + 10) + ",0)");
        var featureData = features.map(function (f, i) { return ({
            text: model.meta.featureNames[f],
            x: xs[i],
            width: widths[i],
            count: featureCounts[f],
            cutPoints: model.discretizers[f].cutPoints,
            range: model.meta.ranges[f],
            categories: model.meta.categories[f],
            expanded: expandedFeatures.has(f),
            feature: f
        }); });
        this.headerPainter.data(featureData)
            .update({ duration: duration, rotate: headerRotate, headerSize: headerSize, onClick: this.clickFeature })
            .render(root);
        return this;
    };
    RuleMatrixPainter.prototype.renderCursorFollow = function (root, cursorFollow) {
        cursorFollow.attr('display', 'none');
        var tooltip = this.renderToolTip(cursorFollow);
        var ruler = this.renderLine(cursorFollow);
        var height = this.getHeight();
        var width = this.getWidth();
        var flowWidth = this.params.flowWidth;
        root
            .on('mousemove', function () {
            var pos = d3.mouse(this);
            cursorFollow.attr('transform', "translate(" + pos[0] + ",0)");
            tooltip.attr('transform', "translate(4," + (pos[1] - 6) + ")");
            if (pos[0] < flowWidth || pos[0] > flowWidth + width) {
                ruler.attr('display', 'none');
            }
            else {
                ruler.select('line').attr('y2', height);
                ruler.attr('display', null);
            }
        })
            .on('mouseover', function () { return cursorFollow.attr('display', null); })
            .on('mouseout', function () { return cursorFollow.attr('display', 'none'); });
        this.rowPainter.update({ tooltip: tooltip });
        return this;
    };
    RuleMatrixPainter.prototype.renderToolTip = function (cursorFollow) {
        var tooltipEnter = cursorFollow.selectAll('g.rm-tooltip')
            .data(['tooltip']).enter()
            .append('g').attr('class', 'rm-tooltip')
            .attr('transform', "translate(4,-6)");
        tooltipEnter.append('rect').attr('class', 'rm-tooltip');
        // .attr('stroke', '#444').attr('stroke-opacity', 0.4);
        tooltipEnter.append('text').attr('class', 'rm-tooltip')
            .attr('text-anchor', 'start').attr('dx', 5).attr('dy', -2);
        var tooltip = cursorFollow.select('g.rm-tooltip');
        return tooltip;
    };
    RuleMatrixPainter.prototype.renderLine = function (cursorFollow) {
        // root.
        var ruler = cursorFollow.selectAll('g.cursor-ruler').data(['g'])
            .enter().append('g').attr('class', 'cursor-ruler');
        ruler.append('line').attr('x1', -2).attr('x2', -2).attr('y1', 0).attr('y2', 100);
        // root.on('mouseover.line', () => cursorFollow.attr('display', null));
        // root.on('mouseout.line', )
        return cursorFollow.select('g.cursor-ruler');
        // return this;
    };
    RuleMatrixPainter.prototype.renderButton = function (buttonGroup) {
        buttonGroup.attr('transform', "translate(0,-150)");
        var g = buttonGroup.selectAll('g.reset-button').data(['g']).enter()
            .append('g').attr('class', 'reset-button')
            .on('click', this.collapseAll);
        var rect = g.append('rect').attr('rx', 3).attr('ry', 3)
            .attr('stroke', '#888').attr('fill', 'white');
        var text = g.append('text')
            .attr('text-anchor', 'start').text('Collapse All')
            .attr('fill', '#444')
            .attr('y', 17).attr('dx', 5);
        var node = text.node();
        var box = node ? node.getBBox() : null;
        rect.attr('width', box ? box.width + 10 : 40)
            .attr('height', box ? box.height + 8 : 20);
        return this;
    };
    RuleMatrixPainter.prototype.registerZoom = function (root, container) {
        var zoomable = this.params.zoomable;
        if (!zoomable) {
            root.on('zoom', null);
            return this;
        }
        // const {x0, y0} = this.params;
        var rootNode = container.node();
        var zoomed = function () {
            if (rootNode) {
                container.attr('transform', d3.event.transform);
            }
        };
        // console.log(width); // tslint:disable-line
        // console.log(height); // tslint:disable-line
        var zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            // .translateExtent([[-2000, -2000], [2000, 2000]])
            .on('zoom', zoomed);
        root.call(zoom);
        return this;
    };
    RuleMatrixPainter.prototype.getHeight = function () {
        var lastRule = this.rules[this.rules.length - 1];
        return lastRule.y + lastRule.height;
    };
    RuleMatrixPainter.prototype.getWidth = function () {
        var _a = this, xs = _a.xs, widths = _a.widths;
        return xs[xs.length - 1] + widths[widths.length - 1];
    };
    RuleMatrixPainter.defaultParams = {
        minSupport: 0.01,
        minFidelity: 0.1,
        color: Painters_1.labelColor,
        elemWidth: 30,
        elemHeight: 30,
        x0: 20,
        y0: 160,
        duration: Painters_1.defaultDuration,
        fontSize: 12,
        headerSize: 13,
        headerRotate: -50,
        paddingX: 0.1,
        paddingY: 0.2,
        paddingLeft: 0.5,
        evidenceWidth: 150,
        expandFactor: [3, 2],
        flowWidth: 50,
        displayFlow: true,
        displayFidelity: true,
        displayEvidence: true,
        zoomable: false,
        tooltip: true
    };
    return RuleMatrixPainter;
}());
exports.default = RuleMatrixPainter;
