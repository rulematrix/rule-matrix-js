import * as React from 'react';
import RuleMatrix, { RuleMatrixPropsOptional } from './components/RuleMatrix';

// import DataTable from './DataTable';
// import { ColorType, labelColor } from './components/Painters/Painter';
import { RuleList, ConditionalStreams, Streams, Support, SupportMat } from './models';

// import * as fs from 'fs';
import Patterns from './components/Patterns';
import Legend from './components/Legend';
import Widgets from './components/Widgets';

export type RuleMatrixStyles = Partial<RuleMatrixPropsOptional>;

export interface AppProps {
  id?: string;
  model?: RuleList;
  streams?: Streams | ConditionalStreams;
  support?: Support | SupportMat;
  input?: number[] | null;
  widgets?: boolean;
  styles?: RuleMatrixStyles;
}

export interface AppState {
  minSupport: number;
  minFidelity: number;
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
    this.onMinSupportChange = this.onMinSupportChange.bind(this);
    this.onMinFidelityChange = this.onMinFidelityChange.bind(this);
    this.state = {
      minSupport: 0.0,
      minFidelity: 0.0,
    };
  }
  public onMinSupportChange(value: number) {
    this.setState({minSupport: value});
  }
  public onMinFidelityChange(value: number) {
    this.setState({minFidelity: value});
  }
  render() {
    const { model, streams, support, input, styles, id, widgets } = this.props;
    const { minSupport, minFidelity } = this.state;
    const height = (styles && styles.height) ? styles.height : 960;
    const width = (styles && styles.width) ? styles.width : 800;
    const rmStyles = {...styles, minSupport, minFidelity};
    return (
      <div>
        {widgets && 
          <Widgets onMinSupportChange={this.onMinSupportChange} onMinFidelityChange={this.onMinFidelityChange}/>
        }
        <svg id={id || 'main'} height={height} width={width}>
          {model &&
            <Patterns labels={model.meta.labelNames} color={styles && styles.color}/>
          }
          {
            model && streams && support && 
            <RuleMatrix 
              model={model} 
              streams={streams} 
              support={support}
              input={input}
              {...rmStyles} 
            />
          }
          {model &&
            <Legend labels={model.meta.labelNames} color={styles && styles.color} transform={`translate(150, 10)`}/>
          }
        </svg>
      </div>
    );
  }
}