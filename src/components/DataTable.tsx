import * as React from 'react';
import * as d3 from 'd3';
import { Table, Collapse } from 'antd';
import { ModelMeta } from '../models/base';
// import DataFilter from './DataFilter';
import { FilterType } from './DataFilter';
import { BasicData, DataSet } from '../models/data';
import * as nt from '../service/num';

import './DataTable.css';

const { Panel } = Collapse;

interface DataElem {
  key: number;
  [key: string]: string | number | null;
}

function computeColumns(meta: ModelMeta, indices?: number[]): any[] {
  const {featureNames} = meta;
  const columns: any[] = [{ title: 'Label', dataIndex: 'label', width: 80, fixed: 'left' }];
  const orders = indices ? indices : d3.range(featureNames.length);
  const minWidth = 60;
  columns.push(
    ...orders.map((i: number) => ({
      title: featureNames[i],
      dataIndex: i.toString(),
      width: featureNames[i].length > 10 ? 100 : Math.max(featureNames[i].length * 10, minWidth),
      className: 'table-header'
    }))
  );
  return columns;
}

interface OptionalProps {
  // colWidth: number;
  // fetchNumber: number;
}

export interface DataTableProps extends Partial<OptionalProps> {
  meta: ModelMeta;
  dataSet?: DataSet;
  height: number;
  // width: number;
  // data: number[][];
  filters: FilterType[];
  indices?: number[];
  // query?: FilterType[];
  getData: (filters: FilterType[], start?: number, end?: number) => Promise<BasicData>;
  // onSubmitFilter?: (filters: FilterType[]) => void;
}

export interface DataTableState {
  columns: any[];
  data: DataElem[];
  totalLength: number;
  end: number;
  loading: boolean;
}

export default class DataTable extends React.Component<DataTableProps, DataTableState> {
  public static defaultProps: OptionalProps = {
    // colWidth: 100
    // fetchNumber: 100,
  };
  constructor(props: DataTableProps) {
    super(props);
    const columns = computeColumns(props.meta, props.indices);
    // this.handleFilterChange = this.handleFilterChange.bind(this);
    // this.handleFilterUpdate = this.handleFilterUpdate.bind(this);
    this.state = { data: [], totalLength: 0, end: 0, loading: false, columns };
  }
  // handleFilterChange(filters: FilterType[]) {
  //   this.setState({ filters });
  //   this.getData(filters, 0);
  //   // this.props.getData(filters, 0).then((baseData: BasicData) => {
  //   //   const {meta} = this.props;
  //   //   const {data, target, end, totalLength} = baseData;
  //   //   const processedData = data.map((elem: number[], i: number): DataElem => {
  //   //     return {key: i};
  //   //   });
  //   //   // const newData = [...(this.state.data), ...processedData];
  //   //   this.setState({data: newData, tot});
  //   // });
  //   return;
  // }

  // handleFilterUpdate(i: number, filter: FilterType): void {
  //   const filters = this.state.filters;
  //   if (filter === this.state.filters[i]) {
  //     console.log(`No update on filter ${i}`); // tslint:disable-line
  //   } else {
  //     const newFilters = [...filters.slice(0, i), filter, ...filters.slice(i + 1)];
  //     this.handleFilterChange(newFilters);
  //   }
  // }

  getData(filters: FilterType[], start: number) {
    this.setState({loading: true});
    this.props.getData(filters, start).then((baseData: BasicData) => {
      const { categories, labelNames } = this.props.meta;
      const { data, target, end, totalLength } = baseData;
      const processedData = data.map((row: number[], i: number): DataElem => {
        const ret = {key: i, label: labelNames[target[i]]};
        row.forEach((d: number, j: number) => {
          const category = categories[j];
          ret[j.toString()] = category ? category[d] : d.toPrecision(4);
        });
        return ret;
      });
      const newData = [...this.state.data.slice(0, start), ...processedData];
      this.setState({ data: newData, end, totalLength, loading: false });
    });
  }

  componentWillReceiveProps(nextProps: DataTableProps) {
    const {meta, indices, dataSet} = nextProps;
    // const updateState: Partial<DataTableState> = {};
    if (meta !== this.props.meta || indices !== this.props.indices || dataSet !== this.props.dataSet) {
      const columns = computeColumns(meta, indices);
      this.setState({columns});
      this.getData(nextProps.filters, 0);
      // updateState.columns = columns;
    }
    // if ()
  }

  componentDidMount() {
    this.getData(this.props.filters, 0);
  }

  render() {
    const { height, dataSet } = this.props as DataTableProps & OptionalProps;
    const { data, columns, totalLength } = this.state;

    const totalWidth = nt.sum(columns.map(col => col.width)) + 20;
    let title = `Data Table: ${dataSet ? dataSet.name : 'train'}`;
    if (dataSet)
      title +=  ` | (${totalLength}/${dataSet.data.length})`;
    return (
      <Collapse 
        defaultActiveKey={['1']} 
        // style={{position: 'fixed', bottom: 0}}
      >
        <Panel header={title} key="1">
          <Table
            size="small"
            bordered={true}
            columns={columns}
            dataSource={data}
            scroll={{ y: height, x: totalWidth + 10 }}
            // title={() => title}
            pagination={{ pageSize: 25 }}
            style={{fontSize: 12}}
            loading={this.state.loading}
          />
        </Panel>
      </Collapse>
    );
  }
}
