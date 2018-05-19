import * as React from 'react';
import { Action } from 'redux';
// import * as d3 from 'd3';
import { Condition, Rule, Histogram } from '../../models';
import ConditionView from './ConditionView';
import { collapsedHeight, expandedHeight } from './ConditionView';
import OutputView from './OutputView';
import './index.css';
import { FeatureStatus } from '../../store';

// const MAX_NUM_RULES = 3;

export interface RuleViewProps {
  rule: Rule;
  support: number[];
  featureNames?: (i: number) => string;
  labelNames?: (i: number) => string;
  hists?: (i: number) => Histogram[];
  transform?: string;
  width: number;
  interval: number;
  nConditions: number;

  logicString: string;
  collapsed?: boolean;
  onClickCollapse?: (collapse: boolean) => void;
  featureStatus?(feature: number): FeatureStatus;
  categoryRatios(feature: number, category: number): [number, number, number];
  categoryIntervals(feature: number, category: number): number | (number | null)[];
  selectFeature?({ idx, deselect }: { idx: number; deselect: boolean }): Action;
  mins(i: number): number;
  maxs(i: number): number;
}

export interface RuleViewState {
}

export default class RuleView extends React.Component<RuleViewProps, RuleViewState> {
  constructor(props: RuleViewProps) {
    super(props);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  handleMouseEnter(idx: number) {
    const { selectFeature } = this.props;
    if (selectFeature)
      selectFeature({ idx, deselect: false });
  }
  handleMouseLeave(idx: number) {
    const { selectFeature } = this.props;
    if (selectFeature)
      selectFeature({ idx, deselect: true });
  }
  handleClick(idx: number) {
    const { featureStatus, selectFeature } = this.props;
    if (featureStatus && selectFeature)
      selectFeature({idx, deselect: featureStatus(idx) === FeatureStatus.SELECT});
  }
  render() {
    const { rule, support, featureNames, mins, maxs, 
      categoryIntervals, featureStatus, hists, categoryRatios 
    } = this.props;
    const { transform, interval, nConditions, logicString, labelNames } = this.props;
    const { collapsed, onClickCollapse } = this.props;
    const outputWidth = 120;
    const logicWidth = 70;
    // const conditionWidth = (width - outputWidth - logicWidth - (nConditions - 1) * interval) / nConditions;
    const conditionWidth = 200;
    const outputX = (conditionWidth + interval) * nConditions + 10 + logicWidth;
    const isDefaultRule = rule.conditions[0].feature === -1;
    const height = collapsed ? collapsedHeight : expandedHeight;
    const outputView = (
      <OutputView
        output={rule.output}
        width={outputWidth}
        height={height}
        barWidth={10}
        interval={5}
        transform={`translate(${outputX},${0})`}
        labels={labelNames}
        support={support}
        maxSupport={500}
      />
    );

    const conditions = !isDefaultRule &&
      rule.conditions.map((condition: Condition, i: number) => {
        const { feature, category } = condition;
        const featureName = featureNames ? featureNames(feature) : `X${feature}`;
        const categoryInterval = categoryIntervals(feature, category);
        // const min = condition.feature
        return (
          <ConditionView
            key={i}
            onMouseEnter={e => this.handleMouseEnter(feature)}
            onMouseLeave={e => this.handleMouseLeave(feature)}
            onClick={e => this.handleClick(feature)}
            featureName={featureName}
            category={categoryInterval}
            width={conditionWidth}
            min={mins(condition.feature)}
            max={maxs(condition.feature)}
            hist={hists ? hists(condition.feature) : undefined}
            transform={`translate(${(conditionWidth + interval) * i},${0})`}
            activated={featureStatus ? featureStatus(feature) >= FeatureStatus.HOVER : false}
            ratios={categoryRatios(feature, category)}
            collapsed={collapsed}
          />
        );
      });

    return (
      <g transform={transform}>
        <text textAnchor="end" x={logicWidth - 4} y={height - 6} className="logic-text">
          {logicString}
        </text>
        {!isDefaultRule && <text 
          textAnchor="start" 
          className="collapse-control" 
          x={logicWidth + 4} 
          y={height - 6}
          onClick={() => onClickCollapse && onClickCollapse(!Boolean(this.props.collapsed))}
        >
          {collapsed ? '+' : 'x'}
        </text>}
        <g transform={`translate(${logicWidth},0)`}>
          {/* {!isDefaultRule && <rect 
            width={conditionWidth * rule.conditions.length + interval * (rule.conditions.length - 1)} 
            height={collapsed ? height : fontSize * 2}
            fill="none"
            stroke="#aaa"
            strokeWidth="1px"
            rx="5"
            ry="5"
          />} */}
          {conditions}
          <path 
            d={`M 25 ${height + 5} h ${(conditionWidth + interval) * nConditions - interval - 30}`}
            strokeWidth="1px"
            stroke="#aaa"
          />
        </g>
        {!isDefaultRule &&
          rule.conditions.slice(0, -1).map((condition: Condition, i: number) => {
            const x = conditionWidth * (i + 1) + interval * (i + 0.5) + logicWidth + 10;
            // const pathData = `M ${
            //   conditionWidth * (i + 1) + interval * (i + 0.5) + logicWidth + (hists ? 0 : 10)
            // } ${10} v ${height - 20}`;
            return (
              // <path key={i} d={pathData} stroke="#aaa" strokeWidth="0.5" />
              <text key={i} textAnchor="middle" x={x} y={height - 6} className="logic-text">
                AND
              </text>
            );
          })}
        {outputView}
      </g>
    );
  }
}
