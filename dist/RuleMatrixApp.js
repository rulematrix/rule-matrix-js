"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var RuleMatrix_1 = require("./components/RuleMatrix");
// import * as fs from 'fs';
var patterns_1 = require("./components/patterns");
var Legend_1 = require("./components/Legend");
var Widgets_1 = require("./components/Widgets");
/**
 * RuleMatrixApp is a functional svg component that wraps RuleMatrix (which renders a group element).
 *
 * @export
 * @class RuleMatrixApp
 * @extends {React.Component<AppProps, AppState>}
 */
var RuleMatrixApp = /** @class */ (function (_super) {
    tslib_1.__extends(RuleMatrixApp, _super);
    function RuleMatrixApp(props) {
        var _this = _super.call(this, props) || this;
        _this.onMinSupportChange = _this.onMinSupportChange.bind(_this);
        _this.onMinFidelityChange = _this.onMinFidelityChange.bind(_this);
        _this.state = {
            minSupport: 0.0,
            minFidelity: 0.0,
        };
        return _this;
    }
    RuleMatrixApp.prototype.onMinSupportChange = function (value) {
        this.setState({ minSupport: value });
    };
    RuleMatrixApp.prototype.onMinFidelityChange = function (value) {
        this.setState({ minFidelity: value });
    };
    RuleMatrixApp.prototype.render = function () {
        var _a = this.props, model = _a.model, streams = _a.streams, support = _a.support, input = _a.input, styles = _a.styles, id = _a.id, widgets = _a.widgets;
        var _b = this.state, minSupport = _b.minSupport, minFidelity = _b.minFidelity;
        var height = (styles && styles.height) ? styles.height : 960;
        var width = (styles && styles.width) ? styles.width : 800;
        var rmStyles = tslib_1.__assign({}, styles, { minSupport: minSupport, minFidelity: minFidelity });
        return (React.createElement("div", null,
            widgets &&
                React.createElement(Widgets_1.default, { onMinSupportChange: this.onMinSupportChange, onMinFidelityChange: this.onMinFidelityChange }),
            React.createElement("svg", { id: id || 'main', height: height, width: width },
                model &&
                    React.createElement(patterns_1.default, { labels: model.meta.labelNames, color: styles && styles.color }),
                model && streams && support &&
                    React.createElement(RuleMatrix_1.default, tslib_1.__assign({ model: model, streams: streams, support: support, input: input }, rmStyles)),
                model &&
                    React.createElement(Legend_1.default, { labels: model.meta.labelNames, color: styles && styles.color, transform: "translate(150, 10)" }))));
    };
    return RuleMatrixApp;
}(React.Component));
exports.default = RuleMatrixApp;
