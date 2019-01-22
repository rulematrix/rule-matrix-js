import * as tslib_1 from "tslib";
import * as React from 'react';
import RuleMatrix from './components/RuleMatrix';
// import * as fs from 'fs';
import Patterns from './components/patterns';
import Legend from './components/Legend';
import Widgets from './components/Widgets';
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
                React.createElement(Widgets, { onMinSupportChange: this.onMinSupportChange, onMinFidelityChange: this.onMinFidelityChange }),
            React.createElement("svg", { id: id || 'main', height: height, width: width },
                model &&
                    React.createElement(Patterns, { labels: model.meta.labelNames, color: styles && styles.color }),
                model && streams && support &&
                    React.createElement(RuleMatrix, tslib_1.__assign({ model: model, streams: streams, support: support, input: input }, rmStyles)),
                model &&
                    React.createElement(Legend, { labels: model.meta.labelNames, color: styles && styles.color, transform: "translate(150, 10)" }))));
    };
    return RuleMatrixApp;
}(React.Component));
export default RuleMatrixApp;
