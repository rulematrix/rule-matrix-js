import * as React from 'react';
import { Action } from 'redux';
// import { Rule } from '../../models';
import './index.css';
import { FeatureStatus } from '../../store';

export interface FeatureProps {
  x: number;
  y: number;
  unitLength: number;
  nRefs: number;
  fontSize: number;
  featureName: string;
  status?: FeatureStatus;
  onMouseEnter?: React.MouseEventHandler<SVGGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGGElement>;
  onClick?: React.MouseEventHandler<SVGGElement>;
}

export interface FeatureState {
  // isSelected: boolean;
}

export class Feature extends React.Component<FeatureProps, FeatureState> {
  constructor(props: FeatureProps) {
    super(props);
    // this.state = {
    //   isSelected: false
    // };
  }

  render() {
    const { featureName, unitLength, fontSize, x, y, nRefs } = this.props;
    const { onMouseEnter, onMouseLeave, onClick, status } = this.props;
    const isSelected = status ? status > FeatureStatus.DEFAULT : false;
    const height = fontSize * 1.5;
    const yText = height - fontSize * 0.3;
    const width = unitLength * nRefs;
    return (
      <g transform={`translate(${x},${y})`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
        <rect width={width} height={height} className={isSelected ? 'feature-rect-active' : 'feature-rect'} />
        <text x={2} y={yText} textAnchor="right" fontSize={fontSize} fontWeight={isSelected ? 700 : 300}>
          {featureName} ({nRefs})
        </text>
        {/* <text x={width + 2} y={height - fontSize * 0.3} textAnchor="right" fontSize={fontSize}>{nRefs}</text> */}
      </g>
    );
  }
}

interface FeatureListOptional {
  interval: number;
  fontSize: number;
  transform: string;
}

export interface FeatureListProps extends Partial<FeatureListOptional> {
  width: number;
  featureNames?: string[];
  featureCounts: number[];
  selectFeature?: ({ idx, deselect }: { idx: number; deselect: boolean }) => Action;
  featureStatus?(i: number): FeatureStatus;
}

export interface FeatureListState {}

export default class FeatureList extends React.Component<FeatureListProps, FeatureListState> {
  public static defaultProps: Partial<FeatureListProps> = {
    interval: 5,
    fontSize: 11,
    transform: 'translate(5,5)'
  };
  constructor(props: FeatureListProps) {
    super(props);
    this.state = {};
  }
  handleMouseEnter(idx: number) {
    const { selectFeature } = this.props;
    if (selectFeature) selectFeature({ idx, deselect: false });
  }
  handleMouseLeave(idx: number) {
    const { selectFeature } = this.props;
    if (selectFeature) selectFeature({ idx, deselect: true });
  }
  handleClick(idx: number) {
    const { featureStatus, selectFeature } = this.props;
    if (selectFeature && featureStatus)
      selectFeature({idx, deselect: featureStatus(idx) === FeatureStatus.SELECT});
  }
  render() {
    const { 
      width, featureNames, featureCounts, featureStatus, transform, interval, fontSize 
    } = this.props as FeatureListOptional & FeatureListProps;

    const features = featureCounts.map((count: number, idx: number) => ({
      featureName: featureNames ? featureNames[idx] : `X${idx}`,
      count,
      idx
    }));
    features.sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...featureCounts);
    const unitLength = width / maxCount;
    return (
      <g transform={transform}>
        {features.map(({ featureName, count, idx }: { featureName: string; count: number; idx: number }, i: number) => {
          return (
            <Feature
              key={idx}
              onMouseEnter={e => this.handleMouseEnter(idx)}
              onMouseLeave={e => this.handleMouseLeave(idx)}
              onClick={e => this.handleClick(idx)}
              x={0}
              y={(interval + fontSize * 1.5) * i}
              unitLength={unitLength}
              nRefs={count}
              featureName={featureName}
              fontSize={fontSize}
              status={featureStatus ? featureStatus(idx) : FeatureStatus.DEFAULT}
            />
          );
        })}
      </g>
    );
  }
}
