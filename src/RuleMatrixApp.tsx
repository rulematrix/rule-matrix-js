import * as React from 'react';
import RuleMatrix, { RuleMatrixPropsOptional } from './components/RuleMatrix';

// import DataTable from './DataTable';
// import { ColorType, labelColor } from './components/Painters/Painter';
import { RuleList, ConditionalStreams, Streams, Support, SupportMat } from './models';

// import * as fs from 'fs';
import Patterns from './components/Patterns';
import Legend from './components/Legend';

export type RuleMatrixStyles = Partial<RuleMatrixPropsOptional>;

export interface AppProps {
  id?: string;
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
    const { model, streams, support, input, styles, id } = this.props;
    const height = (styles && styles.height) ? styles.height : 960;
    const width = (styles && styles.width) ? styles.width : 800;
    return (
      <svg id={id || 'main'} height={height} width={width}>
        {model &&
          <Patterns labels={model.meta.labelNames} color={styles && styles.color}/>
        }
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
    );
  }
}