import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Switch } from 'antd';
import { RootState, Dispatch, changeSettingsAndFetchData, Settings } from '../store';
import { DataSet } from '../models/data';
import { getSelectedData } from '../store/selectors';
// import { ModelBase } from '../models/base';

export interface SettingsStateProps {
  settings: Settings;
  dataSets: DataSet[];
  // model: ModelBase | null;
}

export interface SettingsDispatchProps {
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export interface SettingsControlProps extends SettingsStateProps, SettingsDispatchProps {
}

class SettingsControl extends React.Component<SettingsControlProps, any> {
  constructor(props: SettingsControlProps) {
    super(props);
  }
  // changeStyles(value: number) {
  //   this.props.changeStyles({width: value});
  // }
  render() {
    const {updateSettings} = this.props;
    const hasData = Boolean(this.props.dataSets.length);
    const common = {
      size: 'small' as 'small', disabled: !hasData
    };
    return (
      <div style={{ paddingLeft: 12 }}>

        <Row style={{marginTop: 8}}>
          <Col span={14}>
            <span>Conditional: </span>
          </Col>
          <Col span={10}>
            <Switch 
              checked={this.props.settings.conditional}
              onChange={(conditional) => updateSettings({conditional})}
              {...common}
            />
          </Col>
        </Row>
        <Row style={{marginTop: 8}}>
          <Col span={14}>
            <span>Detail Output: </span>
          </Col>
          <Col span={10}>
            <Switch 
              checked={this.props.settings.supportMat}
              onChange={(supportMat) => updateSettings({supportMat})}
              {...common}
            />
          </Col>
        </Row>
        {/* <Row style={{marginTop: 8}}>
          <Col span={14}>
            <span>Rule Filter:</span>
          </Col>
          <Col span={10}>
            <Slider 
              min={0.0}
              max={0.1}
              defaultValue={0.01}
              step={0.002}
              // value={this.props.settings.minSupport}
              onAfterChange={(minSupport: number) => updateSettings({minSupport})}
              disabled={!model}
            />
          </Col>
        </Row> */}
        {/* </Slider> */}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): SettingsStateProps => {
  return {
    settings: state.settings,
    dataSets: getSelectedData(state),
    // model: getModel(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): SettingsDispatchProps => {
  return {
    // loadModel: bindActionCreators(getModel, dispatch),
    updateSettings: (newSettings: Partial<Settings>) => dispatch(changeSettingsAndFetchData(newSettings))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsControl);
