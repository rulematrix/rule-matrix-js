import * as React from 'react';
import { connect } from 'react-redux';
import { Layout, Card } from 'antd';
import { FilterType } from '../components/DataFilter';
// import { BasicData, ModelMeta } from '../models';
import DataTable from '../components/DataTable';
import DataFilter from '../components/DataFilter';
import ModelView from './ModelView';
import { RootState, changeFilterAndFetchData, Dispatch, getModel, getSelectedData } from '../store';
import { ModelBase, rankModelFeatures, DataSet, DataTypeX } from '../models';
import dataService from '../service/dataService';
import { selectDatasetAndFetchSupport, fetchDatasetIfNeeded, predictInput } from '../store/actions';

const { Content, Sider } = Layout;
// const { Panel } = Collapse;

interface StateToProps {
  model: ModelBase | null;
  dataSets: DataSet[];
}

interface DispatchToProps {
  changeData?: (filters: FilterType[]) => void;
  selectData: (names: DataTypeX[]) => void;
  loadModelData: (datasetName: string, dataType: DataTypeX) => void;
  predict?: (input: number[] | null) => void;
  // loadModelData: (modelName: string, dataType: DataTypeX): void =>
  //   dispatch(fetchDatasetIfNeeded({ modelName, dataType }))
}

export interface MainProps extends StateToProps, DispatchToProps {
  modelName: string;
}

export interface MainState {
  filters: FilterType[];
  collapsed: boolean;
}

export class Main extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    // const filters = new Array(props.model.meta.featureNames.length).fill(null);
    this.state = { filters: [], collapsed: false };
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterUpdate = this.handleFilterUpdate.bind(this);
    this.handleSubmitFilter = this.handleSubmitFilter.bind(this);
    this.onCollapseSider = this.onCollapseSider.bind(this);
  }
  handleFilterChange(filters: FilterType[]) {
    this.setState({ filters });
    // this.getData(filters, 0);
    // this.props.getData(filters, 0).then((baseData: BasicData) => {
    //   const {meta} = this.props;
    //   const {data, target, end, totalLength} = baseData;
    //   const processedData = data.map((elem: number[], i: number): DataElem => {
    //     return {key: i};
    //   });
    //   // const newData = [...(this.state.data), ...processedData];
    //   this.setState({data: newData, tot});
    // });
    return;
  }

  handleFilterUpdate(i: number, filter: FilterType): void {
    const filters = this.state.filters;
    if (filter === this.state.filters[i]) {
      console.log(`No update on filter ${i}`); // tslint:disable-line
    } else {
      console.log(`Update filter ${i}`); // tslint:disable-line
      const newFilters = [...filters.slice(0, i), filter, ...filters.slice(i + 1)];
      this.handleFilterChange(newFilters);
    }
  }

  handleSubmitFilter() {
    const changeData = this.props.changeData;
    console.log('Clicked submit'); // tslint:disable-line
    if (changeData) {
      changeData(this.state.filters);
    }
  }

  onCollapseSider(collapsed: boolean) {
    this.setState({ collapsed });
  }

  componentWillReceiveProps(nextProps: MainProps) {
    const {model} = nextProps;
    if (model !== this.props.model) {
      const filters = model ? new Array(model.meta.featureNames.length).fill(null) : [];
      if (model) {
        setTimeout(
          () => {
            this.props.loadModelData(model.name, 'train');
            this.props.selectData(['train']);
          }, 
          400
        );
      }
      this.setState({filters});
    }
  }

  render() {
    const { model, modelName, dataSets, predict } = this.props;
    const indices = model ? rankModelFeatures(model) : undefined;
    const {filters} = this.state;
    // const width = 1200;
    const height = 130;
    const dataSet = dataSets[0] as (DataSet | undefined);
    return (
      <Content>
        <Layout>
          <Content>
            <ModelView modelName={modelName} />
          </Content>
          <Sider 
            width={300} 
            style={{ background: '#fff' }}
            // collapsible={true}
            // collapsed={this.state.collapsed}
            // onCollapse={this.onCollapseSider}
          >
          {/* {this.state.collapsed && 'Data Filter'} */}
            {model &&
            <Card style={this.state.collapsed ? {display: 'none'} : {}}>
              <DataFilter
                meta={model.meta} 
                filters={filters} 
                onChangeFilter={this.handleFilterUpdate}
                onSubmitFilter={this.handleSubmitFilter}
                indices={indices}
                onPredict={predict}
              />
            </Card>
            }
          </Sider>
        </Layout>
        {/* <Footer> */}
          {model &&
          <DataTable
            dataSet={dataSet}
            filters={filters}
            // ref={(ref: DataTable) => this.tableRef = ref}
            meta={model.meta}
            height={height}
            getData={(_filters: FilterType[], start?: number, end?: number) =>
              dataService.getFilterData(model.name, dataSet ? dataSet.name : 'train', _filters, start, end)
            }
            indices={indices}
          />
          }
        {/* </Footer> */}
      </Content>
    );
  }
}

const mapStateToProps = (state: RootState): StateToProps => {
  return {
    model: getModel(state),
    dataSets: getSelectedData(state),
    // modelName
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): DispatchToProps => {
  return {
    changeData: (filters: FilterType[]) => dispatch(changeFilterAndFetchData(filters)),
    selectData: (names: DataTypeX[]): void => dispatch(selectDatasetAndFetchSupport(names)),
    loadModelData: (modelName: string, dataType: DataTypeX): void =>
      dispatch(fetchDatasetIfNeeded({ modelName, dataType })),
    predict: (input: number[] | null) => dispatch(predictInput(input)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);