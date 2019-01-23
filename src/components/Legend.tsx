import * as React from 'react';
import * as d3 from 'd3';
import { ColorType, labelColor } from './Painters';
import './Legend.css';

export interface OptionalProps {
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
    labelSize: 12,
    fontSize: 14,
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
    const selector = d3.select<SVGElement, string[]>(this.ref);
    const label = selector.selectAll<SVGGElement, string[]>('g.rm-label').data(labels);

    // ENTER
    const labelEnter = label.enter().append('g').attr('class', 'rm-label');
    labelEnter.append('rect')
      // .attr('x', (d: string, i: number) => delta * i)
      .attr('y', -(fontSize + labelSize) / 2.2)
      .attr('width', labelSize)
      .attr('height', labelSize);

    labelEnter.append('text').attr('text-anchor', 'start').attr('x', labelSize * 1.3).style('font-size', fontSize);

    const labelUpdate = labelEnter.merge(label)
      .attr('fill', (d, i) => color(i));
    labelUpdate.transition()
      .duration(duration)
      .attr('transform', (d, i) => `translate(${i * delta + 50}, ${fontSize * 1.2})`);

    labelUpdate.select('text').text((d) => d);

    label.exit()
      .transition()
      .duration(duration)
      .style('fill-opacity', 1e-6)
      .remove();

    // Striped Prediction Legends
    const predict = selector.selectAll('g.rm-predict').data(labels);

    // ENTER
    const predictEnter = predict.enter().append('g').attr('class', 'rm-predict');
    predictEnter.append('rect')
      // .attr('x', (d: string, i: number) => delta * i)
      .attr('y', -(fontSize + labelSize) / 2.2)
      .attr('width', labelSize)
      .attr('height', labelSize);

    const predictUpdate = predictEnter.merge(label)
      .attr('fill', (d, i) => `url("#stripe-${color(i).slice(1)}")`);
    predictUpdate.transition()
      .duration(duration)
      .attr('transform', (d, i) =>
        `translate(${i * (labelSize * 1.5) + labels.length * delta + 50}, ${fontSize * 1.2})`
      );

    const predictText = selector.selectAll<SVGTextElement, string[]>('text.rm-predict')
      .data(['Wrong Predictions']);
    predictText.enter()
      .append('text').merge(predictText)
      .attr('text-anchor', 'start').attr('x', labels.length * labelSize * 1.5 + labels.length * delta + 50)
      .attr('y', fontSize * 1.2)
      .style('font-size', fontSize).text((d) => d);

    predict.exit()
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
      <g ref={(ref: SVGGElement) => this.ref = ref} className="rm-labels" transform={this.props.transform}>
        <text textAnchor="start" x="0" y="17" fontSize="14">Labels:</text>
      </g>
    );
  }
}
