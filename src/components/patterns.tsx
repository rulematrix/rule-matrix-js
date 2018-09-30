import * as React from 'react';
import { ColorType, defaultColor } from './Painters/Painter';

const patternStrokeWidth = 3;
const patternPadding = 5;

export interface PatternsProps {
  color?: ColorType;
  labels: string[];
}

/**
 * The filling patterns used in the visualization. 
 * This will render a def tag, which should be in the beginning inside of the svg.
 * @export
 * @param {PatternsProps} props
 * @returns
 */
export default function Patterns (props: PatternsProps) {
  const color = props.color || defaultColor;
  const labels = props.labels;
  return (
    <defs>
      {labels.map((label, i) => {
        const iColor = color(i);
        const name = `stripe-${iColor.slice(1)}`;
        return (<pattern 
          key={name} 
          id={name} 
          width={patternPadding} 
          height={patternPadding}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <path 
            d={`M 0 ${patternPadding / 2} H ${patternPadding}`} 
            style={{strokeLinecap: 'square', strokeWidth: `${patternStrokeWidth}px`, stroke: iColor}}
          />
        </pattern>);
      })}
    </defs>
  );
}
