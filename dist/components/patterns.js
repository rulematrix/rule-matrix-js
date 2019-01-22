import * as React from 'react';
import { defaultColor } from './Painters/Painter';
var patternStrokeWidth = 3;
var patternPadding = 5;
/**
 * The filling patterns used in the visualization.
 * This will render a def tag, which should be in the beginning inside of the svg.
 * @export
 * @param {PatternsProps} props
 * @returns
 */
export default function Patterns(props) {
    var color = props.color || defaultColor;
    var labels = props.labels;
    return (React.createElement("defs", null, labels.map(function (label, i) {
        var iColor = color(i);
        var name = "stripe-" + iColor.slice(1);
        return (React.createElement("pattern", { key: name, id: name, width: patternPadding, height: patternPadding, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-45)" },
            React.createElement("path", { d: "M 0 " + patternPadding / 2 + " H " + patternPadding, style: { strokeLinecap: 'square', strokeWidth: patternStrokeWidth + "px", stroke: iColor } })));
    })));
}
