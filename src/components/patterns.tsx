import * as React from 'react';

export interface PatternsProps {
}

export function Patterns (props: PatternsProps) {
    return (
      <defs>
        <pattern 
          id="pattern-stripe" 
          width="3" 
          height="3" 
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="1" height="3" transform="translate(0,0)" fill="white" />
        </pattern>
        <mask id="mask-stripe">
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="url(#pattern-stripe)" 
            // stroke="white" 
            // strokeWidth="4" 
          />
        </mask>
      </defs>
    );
}
