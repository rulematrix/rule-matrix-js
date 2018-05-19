import * as React from 'react';
import * as d3 from 'd3';
import { ColorType, labelColor } from './Painters';
import './Legend.css';

interface OptionalProps {
  labelSize: number;
  fontSize: number;
  color: ColorType;
  duration: number;
  transform: string;
}

export interface LegendProps extends Partial<OptionalProps> {
  labels: string[];
}

export interface LegendState {
}

export default class Legend extends React.PureComponent<LegendProps, LegendState> {
  public static defaultProps: OptionalProps = {
    labelSize: 10,
    fontSize: 12,
    color: labelColor,
    duration: 400,
    transform: '',
  };
  private ref: SVGGElement;
  constructor(props: LegendProps) {
    super(props);
  }
  update() {
    const {labels, labelSize, fontSize, color, duration} = this.props as OptionalProps & LegendProps;
    const delta = labelSize + 80;
    const selector = d3.select(this.ref);
    const label = selector.selectAll('g.label').data(labels);

    // ENTER
    const labelEnter = label.enter().append('g').attr('class', 'label');
    labelEnter.append('rect')
      // .attr('x', (d: string, i: number) => delta * i)
      .attr('y', -(fontSize + labelSize) / 2)
      .attr('width', labelSize)
      .attr('height', labelSize);
    
    labelEnter.append('text').attr('text-anchor', 'start').attr('x', labelSize * 1.2);

    const labelUpdate = labelEnter.merge(label)
      .attr('fill', (d, i) => color(i));
    labelUpdate.transition()
      .duration(duration)
      .attr('transform', (d, i) => `translate(${i * delta}, ${fontSize * 1.2})`);
    
    labelUpdate.select('text').text((d) => d);

    label.exit()
      .transition()
      .duration(duration)
      .style('fill-opacity', 1e-6)
      .remove();
  }

  componentDidMount() {
    this.update();
  }
  componentDidUpdate() {
    this.update();
  }
  render() {
    return (
      <g ref={(ref: SVGGElement) => this.ref = ref} className="labels" transform={this.props.transform}/>
    );
  }
}
