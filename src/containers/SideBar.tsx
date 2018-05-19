import { Card, Divider, Collapse } from 'antd';
// import { Menu, Icon } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { RuleModel, ModelBase, isTreeModel, isRuleModel } from '../models';
import { RootState, getModel } from '../store';
import DataSelector from './DataSelector';
import './SideBar.css';
import TreeStyleControl from './TreeStyleControl';
import RuleStyleControl from './RuleStyleControl';
import ModelInfo from '../components/ModelInfo';
import SettingsControl from './SettingsControl';
import RuleFilter from './RuleFilter';

const { Panel } = Collapse;

export interface SideBarStateProp {
  model: RuleModel | ModelBase | null;
}

const mapStateToProps = (state: RootState): SideBarStateProp => {
  return {
    model: getModel(state),
    // modelIsFetching: getModelIsFetching(state),
    // data: getData(state)
  };
};

export interface SideBarProps extends SideBarStateProp {
  // width: number;
  collapsed?: boolean;
}

export interface SideBarState {
  activeKey: string | string[];
}

const defaultActiveKey = ['1', '2', '3', '4', '5'];

class SideBar extends React.Component<SideBarProps, SideBarState> {
  constructor(props: SideBarProps) {
    super(props);
    this.state = {activeKey: defaultActiveKey};
    this.onChange = this.onChange.bind(this);
  }
  onChange(key: string | string[]) {
    this.setState({activeKey: key});
  }
  render() {
    const {model, collapsed} = this.props;
    let i = 1;
    return (
      <Card bordered={false}>
        <Divider>Controls</Divider>
          <Collapse 
            bordered={false} 
            activeKey={this.props.collapsed === true ? undefined : this.state.activeKey} 
            onChange={this.onChange}
          >
            {model !== null && 
              <Panel header={collapsed ? 'M' : 'Model Info: '} key={(i++).toString()}>
                <ModelInfo model={model}/>
              </Panel>
            }
            {model !== null && 
              <Panel header={collapsed ? 'D' : `Dataset: ${model.dataset}`} key={(i++).toString()}>
                <DataSelector datasetName={model.dataset}/>
              </Panel>
            }
            {model !== null && isTreeModel(model) && 
              <Panel header={collapsed ? 'S' : 'Styles'} key={(i++).toString()}>
                <TreeStyleControl/>
                {/* <DataSelector key={(i++).toString()} datasetName={model.dataset}/> */}
              </Panel>
            }
            {model !== null && isRuleModel(model) && 
              <Panel header={collapsed ? 'S' : 'Styles'} key={(i++).toString()}>
                <RuleStyleControl/>
                {/* <DataSelector key={(i++).toString()} datasetName={model.dataset}/> */}
              </Panel>
            }
            {model !== null && 
              <Panel header={collapsed ? 'S' : `Settings`} key={(i++).toString()}>
                <SettingsControl/>
              </Panel>
            }
            {model !== null && 
              <Panel header={collapsed ? 'S' : `Rule Filters`} key={(i++).toString()}>
                <RuleFilter/>
              </Panel>
            }
          </Collapse>
      </Card>
      // <Menu theme="light" mode="inline">
      //   <Menu.Item key="1" disabled={true}>
      //     <Icon type="pie-chart" />
          // dataSelector
      //   </Menu.Item>
      //   <Menu.Item key="2" disabled={true}>
      //     <Icon type="pie-chart" />
      //     {/* {dataSelector} */}
      //   </Menu.Item>
      // </Menu>
    );
  }
}

export default connect(mapStateToProps)(SideBar);