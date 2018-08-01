import * as React from 'react';
import './app.css';
import RuleMatrix from './components/RuleMatrix';

// import DataTable from './DataTable';
// import { ColorType, labelColor } from './components/Painters/Painter';
import { RuleList } from './models/ruleModel';
import { ConditionalStreams, Streams, Support, SupportMat } from './models/data';

// import * as fs from 'fs';
import { Patterns } from './components/patterns';
import { RuleMatrixPropsOptional } from './components/RuleMatrix/index';
import Legend from './components/Legend';

// export interface RuleStyles {
//   flowWidth: number;
//   rectWidth: number;
//   rectHeight: number;
//   displayFlow: boolean;
//   displayFidelity: boolean;
//   displayEvidence: boolean;
//   zoomable: boolean;
//   // mode: 'list' | 'matrix';
//   color: ColorType;
//   // conditional: boolean;
// }

export type RuleMatrixStyles = Partial<RuleMatrixPropsOptional>;

export interface AppProps {
  model?: RuleList;
  streams?: Streams | ConditionalStreams;
  support?: Support | SupportMat;
  input?: number[] | null;
  styles?: RuleMatrixStyles;
}

export interface AppState {

}

/**
 * RuleMatrixApp is a functional svg component that wraps RuleMatrix (which renders a group element).
 *
 * @export
 * @class RuleMatrixApp
 * @extends {React.Component<AppProps, AppState>}
 */
export default class RuleMatrixApp extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
  }
  render() {
    const { model, streams, support, input, styles} = this.props;
    const height = (styles && styles.height) ? styles.height : 960;
    const width = (styles && styles.width) ? styles.width : 800;
    return (
      // <div className="App">
      <svg id="main" height={height} width={width}>
        <Patterns/>
        {model &&
          <Legend labels={model.meta.labelNames} color={styles && styles.color} transform={`translate(150, 10)`}/>
        }
        {
          model && streams && support && 
          <RuleMatrix 
            model={model} 
            streams={streams} 
            support={support}
            input={input}
            {...styles} 
          />
        }

      </svg>
      // </div>
    );
  }
}