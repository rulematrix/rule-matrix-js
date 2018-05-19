import * as React from 'react';
import { ModelBase, isTreeModel, isSurrogate, isRuleModel } from '../models';
// import { Divider } from 'antd';

export interface ModelInfoProps {
  model: ModelBase;
}

export default class ModelInfo extends React.Component<ModelInfoProps, any> {
  render() {
    const model = this.props.model;
    const infos: [string, string][] = [['type', model.type]];
    if (isTreeModel(model)) {
      infos.push(['#nodes', model.nNodes.toString()]);
      infos.push(['max depth', model.maxDepth.toString()]);
    }
    
    if (isRuleModel(model)) {
      infos.push(['#rules', model.rules.length.toString()]);
      // infos.push(['#nodes', model.nNodes.toString()]);
      // infos.push(['max depth', model.maxDepth.toString()]);
    }
    if (isSurrogate(model)) {
      infos[0][1] += '-explainer';
      // infos.push(['model', 'wine_quality-nn-40-40-40-40-40']);
      infos.push(['model', model.target]);
    }
    return (
      <div style={{ paddingLeft: 12, fontSize: 12 }}>
        {infos.map((info: [string, string], i: number) => {
          return(
          <div key={i}>
            <span>{info[0]}: </span>
            {/* <Divider type="vertical" /> */}
            <code> {info[1]} </code>
          </div>);
        })}
      </div>
    );
  }
}