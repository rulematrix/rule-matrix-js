"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var d3 = require("d3");
// import * as nt from '../../service/num';
require("./index.css");
var Painter_1 = require("../Painters/Painter");
var Painter_2 = require("./Painter");
var RuleMatrix = /** @class */ (function (_super) {
    tslib_1.__extends(RuleMatrix, _super);
    // private painter: RuleMatrixPainter;
    function RuleMatrix(props) {
        var _this = _super.call(this, props) || this;
        // this.stateUpdated = false;
        var painter = new Painter_2.default();
        _this.state = { painter: painter };
        return _this;
    }
    RuleMatrix.prototype.componentDidUpdate = function () {
        // this.stateUpdated = false;
        this.painterUpdate();
    };
    RuleMatrix.prototype.componentDidMount = function () {
        // if (!this.props.react) {
        this.painterUpdate();
        // }
    };
    RuleMatrix.prototype.painterUpdate = function () {
        var _a = this.props, streams = _a.streams, model = _a.model, x0 = _a.x0, y0 = _a.y0, rectWidth = _a.rectWidth, rectHeight = _a.rectHeight, flowWidth = _a.flowWidth, evidenceWidth = _a.evidenceWidth;
        var _b = this.props, minSupport = _b.minSupport, minFidelity = _b.minFidelity, support = _b.support, input = _b.input, color = _b.color, displayFlow = _b.displayFlow, displayEvidence = _b.displayEvidence, zoomable = _b.zoomable;
        // console.log('updating matrix'); // tslint:disable-line
        this.state.painter.update({
            // dataset,
            streams: streams,
            support: support,
            x0: x0, y0: y0,
            input: input,
            color: color,
            // transform: `translate(100, 160)`,
            elemWidth: rectWidth,
            elemHeight: rectHeight,
            evidenceWidth: evidenceWidth,
            flowWidth: displayFlow ? flowWidth : 0,
            displayFlow: displayFlow,
            displayEvidence: displayEvidence,
            // displayFidelity,
            model: model,
            minSupport: minSupport,
            minFidelity: minFidelity,
            zoomable: zoomable,
        })
            .render(d3.select(this.ref));
    };
    RuleMatrix.prototype.render = function () {
        var _this = this;
        var _a = this.props, width = _a.width, height = _a.height, x0 = _a.x0, y0 = _a.y0;
        return (React.createElement("g", { ref: function (ref) { return ref && (_this.ref = ref); }, className: "rule-matrix" },
            React.createElement("rect", { className: "bg", width: width, height: height, fill: "white", fillOpacity: 1e-6, transform: "translate(" + -(x0 || 0) + ", " + -(y0 || 0) + ")" })));
    };
    RuleMatrix.defaultProps = {
        transform: '',
        flowWidth: 40,
        evidenceWidth: 150,
        rectWidth: 30,
        rectHeight: 30,
        displayFlow: true,
        // displayFidelity: true,
        displayEvidence: true,
        zoomable: true,
        color: Painter_1.labelColor,
        minSupport: 0.02,
        minFidelity: 0.1,
        intervalY: 10,
        intervalX: 0.2,
        width: 960,
        height: 800,
        x0: 20,
        y0: 160,
    };
    return RuleMatrix;
}(React.PureComponent));
exports.default = RuleMatrix;
