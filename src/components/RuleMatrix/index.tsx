import * as React from 'react';
import * as d3 from 'd3';

import { RuleList, Streams, ConditionalStreams } from '../../models';
// import * as nt from '../../service/num';

import './index.css';
import { labelColor as defaultLabelColor, ColorType } from '../Painters/Painter';
import RuleMatrixPainter from './Painter';

interface RuleMatrixPropsOptional {
  transform: string;
  rectWidth: number;
  rectHeight: number;
  minSupport: number;
  intervalY: number;
  intervalX: number;
  flowWidth: number;
  color: ColorType;
  width: number;
  height: number;
  x0: number;
  y0: number;
}

export interface RuleMatrixProps extends Partial<RuleMatrixPropsOptional> {
  model: RuleList;
  support: number[][] | number[][][];
  streams?: Streams | ConditionalStreams;
  input?: number[] | null;
}

export interface RuleMatrixState {
  painter: RuleMatrixPainter;
}

export default class RuleMatrix extends React.PureComponent<RuleMatrixProps, RuleMatrixState> {
  public static defaultProps: Partial<RuleMatrixProps> & RuleMatrixPropsOptional = {
    transform: '',
    rectWidth: 30,
    rectHeight: 30,
    minSupport: 0.01,
    intervalY: 10,
    intervalX: 0.2,
    flowWidth: 60,
    color: defaultLabelColor,
    width: 1200,
    height: 800,
    x0: 100,
    y0: 160,
  };
  // private stateUpdated: boolean;
  private ref: SVGGElement;
  // private painter: RuleMatrixPainter;

  constructor(props: RuleMatrixProps) {
    super(props);
    // this.stateUpdated = false;
    const painter = new RuleMatrixPainter();
    this.state = {painter};
  }

  componentDidUpdate() {
    // this.stateUpdated = false;
    this.painterUpdate();
  }
  componentDidMount() {
    // if (!this.props.react) {
    this.painterUpdate();
    // }
  }

  painterUpdate() {
    const {streams, model, rectWidth, rectHeight, flowWidth, minSupport, support, x0, y0, input, color} 
      = this.props;
    console.log('updating matrix'); // tslint:disable-line
    this.state.painter.update({
      // dataset,
      streams, 
      support,
      x0, y0,
      input,
      color,
      // transform: `translate(100, 160)`,
      elemWidth: rectWidth,
      elemHeight: rectHeight,
      flowWidth,
      model,
      minSupport,
    })
      .render(d3.select<SVGGElement, {}>(this.ref));
  }
  render() {
    // const {width, height, x0, y0} = this.props as RuleMatrixProps & RuleMatrixPropsOptional;
    return(
      <g ref={(ref) => ref && (this.ref = ref)} className="rule-matrix">
        {/* <rect stroke="#888" x={-x0} y={-y0} width={width} height={height} fill="none"/> */}
      </g>
    );
  }

}
