"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var rc_slider_1 = require("rc-slider");
require("rc-slider/assets/index.css");
require("./Widgets.css");
var SliderWithTooltip = rc_slider_1.createSliderWithTooltip(rc_slider_1.default);
var FloatSlider = /** @class */ (function (_super) {
    tslib_1.__extends(FloatSlider, _super);
    function FloatSlider(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            value: 0
        };
        _this.onInputChange = _this.onInputChange.bind(_this);
        _this.onSliderChange = _this.onSliderChange.bind(_this);
        _this.onSubmitChange = _this.onSubmitChange.bind(_this);
        return _this;
    }
    FloatSlider.prototype.onSubmitChange = function (value) {
        var _a = this.props, onChange = _a.onChange, delay = _a.delay;
        if (onChange) {
            setTimeout(function () { return onChange(value); }, delay);
        }
    };
    FloatSlider.prototype.onSliderChange = function (value) {
        this.setState({ value: value });
    };
    FloatSlider.prototype.onInputChange = function (e) {
        this.setState({ value: e.target.value });
        this.onSubmitChange(e.target.value);
    };
    FloatSlider.prototype.render = function () {
        var _a = this.props, min = _a.min, max = _a.max, step = _a.step, description = _a.description, showValue = _a.showValue, marks = _a.marks;
        var value = this.props.value === undefined ? this.state.value : this.props.value;
        return (React.createElement("div", { className: "rm-slider", style: { display: 'table', clear: 'both', width: 300, margin: '8px 16px' } },
            description && React.createElement("div", { style: { float: 'left', width: '30%' } }, description),
            React.createElement("div", { style: { width: '46%', float: 'left', marginTop: '8' } },
                React.createElement(SliderWithTooltip, { min: min, max: max, step: step, marks: marks, value: value, onChange: this.onSliderChange, onAfterChange: this.onSubmitChange })),
            showValue && (React.createElement("div", { style: { width: '20%', float: 'right' } },
                React.createElement("input", { type: "number", style: { width: 40, height: 20 }, step: step, value: value, onChange: this.onInputChange })))));
    };
    FloatSlider.defaultProps = {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        showValue: true,
        delay: 300
    };
    return FloatSlider;
}(React.Component));
exports.FloatSlider = FloatSlider;
var Widgets = /** @class */ (function (_super) {
    tslib_1.__extends(Widgets, _super);
    function Widgets(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    Widgets.prototype.render = function () {
        var _a = this.props, onMinSupportChange = _a.onMinSupportChange, onMinFidelityChange = _a.onMinFidelityChange;
        var supportMarks = {};
        var marks = [0.0, 0.05, 0.1, 0.15, 0.2];
        marks.forEach(function (i) {
            supportMarks[i] = String(i);
        });
        var fidelityMarks = {};
        marks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
        marks.forEach(function (i) {
            fidelityMarks[i] = String(i);
        });
        return (React.createElement("div", { className: "rm-widgets" },
            React.createElement("div", { style: { float: 'left' } },
                React.createElement(FloatSlider, { description: "Minimum Support", min: 0.0, max: 0.2, step: 0.01, marks: supportMarks, onChange: onMinSupportChange })),
            React.createElement("div", { style: { float: 'left' } },
                React.createElement(FloatSlider, { description: "Minimum Fidelity", min: 0.0, max: 1.0, step: 0.01, marks: fidelityMarks, onChange: onMinFidelityChange }))));
    };
    return Widgets;
}(React.Component));
exports.default = Widgets;
