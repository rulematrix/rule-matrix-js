import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Slider } from 'antd';
import { RootState, Dispatch, changeSettingsAndFetchData, Settings, getModel } from '../store';
import { ModelBase } from '../models';

export interface SettingsStateProps {
  settings: Settings;
  model: ModelBase | null;
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
    const {updateSettings, model} = this.props;

    return (
      <div style={{ paddingLeft: 12 }}>
        <Row style={{marginTop: 8}}>
          <Col span={12}>
            <span>Min Evidence:</span>
          </Col>
          <Col span={12}>
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
        </Row>
        <Row style={{marginTop: 8}}>
          <Col span={12}>
            <span>Fidelity:</span>
          </Col>
          <Col span={12}>
            <Slider 
              min={0.0}
              max={1.0}
              range={true}
              defaultValue={[0.0, 1.00]}
              step={0.002}
              // value={this.props.settings.minSupport}
              // onAfterChange={(minSupport: number) => updateSettings({minSupport})}
              disabled={!model}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): SettingsStateProps => {
  return {
    settings: state.settings,
    model: getModel(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): SettingsDispatchProps => {
  return {
    // loadModel: bindActionCreators(getModel, dispatch),
    updateSettings: (newSettings: Partial<Settings>) => dispatch(changeSettingsAndFetchData(newSettings))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsControl);
