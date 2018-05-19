import * as React from 'react';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { Slider, Row, Col } from 'antd';
import { RootState, Dispatch, changeTreeStyles, TreeStyles } from '../store';

export interface TreeStyleStateProps {
  linkWidth: number;
}

export interface TreeStyleDispatchProps {
  changeStyles: (newStyles: Partial<TreeStyles>) => Action;
}

export interface TreeStyleControlProps extends TreeStyleStateProps, TreeStyleDispatchProps {
}

class TreeStyleControl extends React.Component<TreeStyleControlProps, any> {
  constructor(props: TreeStyleControlProps) {
    super(props);
  }
  handleChange(value: number) {
    this.props.changeStyles({linkWidth: value});
  }
  render() {
    return (
      <div style={{ paddingLeft: 12 }}>
        <Row>
          <Col span={10}>
            <span>Link width: </span>
          </Col>
          <Col span={14}>
            <Slider 
              min={0.5}
              max={5}
              value={this.props.linkWidth}
              step={0.1}
              onChange={(value: number) => this.handleChange(value)}
            />
          </Col>
        </Row>
        {/* </Slider> */}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): TreeStyleStateProps => {
  return {
    linkWidth: state.treeStyles.linkWidth,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): TreeStyleDispatchProps => {
  return {
    // loadModel: bindActionCreators(getModel, dispatch),
    changeStyles: (newStyles: Partial<TreeStyles>) => dispatch(changeTreeStyles(newStyles))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeStyleControl);
