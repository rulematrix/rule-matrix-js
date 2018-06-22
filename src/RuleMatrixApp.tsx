import * as React from 'react';
import './app.css';
import RuleMatrix from './components/RuleMatrix';

// import DataTable from './DataTable';
import { ColorType } from './components/Painters/Painter';
import { RuleList } from './models/ruleModel';
import { ConditionalStreams, Streams, Support, SupportMat } from './models/data';

// import * as fs from 'fs';
import { Patterns } from './components/patterns';

export interface RuleStyles {
  flowWidth: number;
  rectWidth: number;
  rectHeight: number;
  // mode: 'list' | 'matrix';
  color: ColorType;
  // conditional: boolean;
}

export interface AppProps {
  model?: RuleList;
  streams?: Streams | ConditionalStreams;
  support?: Support | SupportMat;
  input?: number[] | null;
  styles?: RuleStyles;
}
export interface AppState {

}

export default class RuleMatrixApp extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
  }
  render() {
    const { model, streams, support, input, styles } = this.props;
    return (
      // <div className="App">
      <svg id="main" height="800" width="800">
        <Patterns/>
        {
          model && streams && support && styles && 
          <RuleMatrix 
            model={model} 
            streams={streams} 
            transform={''}
            support={support}
            input={input}
            {...styles} 
            minSupport={0.0}
          />
        }

      </svg>
      // </div>
    );
  }
}