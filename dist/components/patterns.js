"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Painter_1 = require("./Painters/Painter");
var patternStrokeWidth = 3;
var patternPadding = 5;
/**
 * The filling patterns used in the visualization.
 * This will render a def tag, which should be in the beginning inside of the svg.
 * @export
 * @param {PatternsProps} props
 * @returns
 */
function Patterns(props) {
    var color = props.color || Painter_1.defaultColor;
    var labels = props.labels;
    return (React.createElement("defs", null, labels.map(function (label, i) {
        var iColor = color(i);
        var name = "stripe-" + iColor.slice(1);
        return (React.createElement("pattern", { key: name, id: name, width: patternPadding, height: patternPadding, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-45)" },
            React.createElement("path", { d: "M 0 " + patternPadding / 2 + " H " + patternPadding, style: { strokeLinecap: 'square', strokeWidth: patternStrokeWidth + "px", stroke: iColor } })));
    })));
}
exports.default = Patterns;
