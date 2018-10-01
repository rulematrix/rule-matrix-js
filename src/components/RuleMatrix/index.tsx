import * as React from 'react';
import * as d3 from 'd3';

import { RuleList, Streams, ConditionalStreams } from '../../models';
// import * as nt from '../../service/num';

import './index.css';
import { labelColor as defaultLabelColor, ColorType } from '../Painters/Painter';
import RuleMatrixPainter from './Painter';

export interface RuleMatrixPropsOptional {
  transform: string;
  flowWidth: number;
  evidenceWidth: number;
  rectWidth: number;
  rectHeight: number;
  displayFlow: boolean;
  // displayFidelity: boolean;
  displayEvidence: boolean;
  zoomable: boolean;
  color: ColorType;
  minSupport: number;
  minFidelity: number;
  intervalY: number;
  intervalX: number;
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
    flowWidth: 40,
    evidenceWidth: 150,
    rectWidth: 30,
    rectHeight: 30,
    displayFlow: true,
    // displayFidelity: true,
    displayEvidence: true,
    zoomable: true,
    color: defaultLabelColor,
    minSupport: 0.02,
    minFidelity: 0.1,
    intervalY: 10,
    intervalX: 0.2,
    width: 960,
    height: 800,
    x0: 20,
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
    const {streams, model, x0, y0, rectWidth, rectHeight, flowWidth, evidenceWidth} 
      = this.props;
    const {minSupport, minFidelity, support, input, color, displayFlow, displayEvidence, zoomable} = this.props;
    // console.log('updating matrix'); // tslint:disable-line
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
      evidenceWidth,
      flowWidth: displayFlow ? flowWidth : 0,
      displayFlow,
      displayEvidence,
      // displayFidelity,
      model,
      minSupport,
      minFidelity,
      zoomable,
    })
      .render(d3.select<SVGGElement, {}>(this.ref));
  }
  render() {
    const {width, height, x0, y0} = this.props;
    return(
      <g ref={(ref) => ref && (this.ref = ref)} className="rule-matrix">
        <rect 
          className="bg" 
          width={width} 
          height={height} 
          fill="white" 
          fillOpacity={1e-6} 
          transform={`translate(${-(x0 || 0)}, ${-(y0 || 0)})`}
        />
      </g>
    );
  }

}
