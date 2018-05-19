import * as React from 'react';
import { connect } from 'react-redux';
import { Tag } from 'antd';
import {
  Dispatch,
  selectDatasetAndFetchSupport,
  fetchDatasetIfNeeded,
  getSelectedDataNames,
  getModel,
  DataBaseState,
  RootState,
  getData,
} from '../store';
import './DataSelector.css';
import { DataTypeX, ModelBase, isSurrogate } from '../models';

const { CheckableTag } = Tag;

type DatasetType = DataTypeX;

const dataNames = ['train', 'test'] as DatasetType[];
const surrogateDataNames = ['train', 'test', 'sample train', 'sample test'] as DatasetType[];

export interface DataSelectorStateProp {
  selectedDataNames: Set<DatasetType>;
  dataBase: DataBaseState;
  model: ModelBase | null;
}

const mapStateToProps = (state: RootState): DataSelectorStateProp => {
  return {
    selectedDataNames: new Set(getSelectedDataNames(state)),
    dataBase: getData(state),
    model: getModel(state),
  };
};

export interface DataSelectorDispatchProp {
  selectData: (names: DatasetType[]) => void;
  loadModelData: (datasetName: string, dataType: DataTypeX) => void;
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): DataSelectorDispatchProp => {
  return {
    // loadModel: bindActionCreators(getModel, dispatch),
    selectData: (names: DatasetType[]): void => dispatch(selectDatasetAndFetchSupport(names)),
    loadModelData: (modelName: string, dataType: DataTypeX): void =>
      dispatch(fetchDatasetIfNeeded({ modelName, dataType }))
  };
};

export interface DataSelectorProps extends DataSelectorStateProp, DataSelectorDispatchProp {
  key: string;
}

export interface DataSelectorState {

}

class DataSelector extends React.Component <DataSelectorProps, DataSelectorState> {
  constructor(props: DataSelectorProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  componentDidMount() {
    // this.props.loadData(this.props.datasetName, 'train');
    // this.props.loadData(this.props.datasetName, 'test');
  }
  render() {
    const model = this.props.model;
    const names = model ? (isSurrogate(model) ? surrogateDataNames : dataNames) : [];
    return (
      <div style={{ paddingLeft: 12 }}>
      {names.map((dataName: DatasetType, i: number) => {
        return (
          <CheckableTag 
            key={i} 
            checked={this.props.selectedDataNames.has(dataName)} 
            onChange={(checked: boolean) => this.onChange(dataName, checked)}
          >
            {dataName}
          </CheckableTag>
        );
      })}
      </div>
    );
  }

  onChange = (dataName: DatasetType, checked: boolean) => {
    const model = this.props.model;
    if (model) {
      this.props.loadModelData(model.name, dataName);
      // do shallow copy
      // const selectedDataNames = new Set(this.props.selectedDataNames);
      // if (checked) selectedDataNames.add(dataName);
      // else selectedDataNames.delete(dataName);
      const selectedDataNames = [dataName];
      this.props.selectData([...selectedDataNames]);
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSelector);