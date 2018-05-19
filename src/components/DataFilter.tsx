import * as React from 'react';
import { Checkbox, Row, Col, Slider, Button, List, Divider, Tooltip } from 'antd';
// import * as nt from '../service/num';
import './DataFilter.css';
import { ModelMeta } from '../models/base';
import * as d3 from 'd3';

const CheckboxGroup = Checkbox.Group;
// const Panel = Collapse.Panel;

export interface DataInputHeaderProps {
  onClickFilter?: () => void;
  onClickPredict?: () => void;
  onClickClear?: () => void;
}

export function DataInputHeader(props: DataInputHeaderProps) {
  const { onClickFilter, onClickPredict, onClickClear } = props;
  const style = {fontSize: 12, marginRight: 12};
  return (
    <div>
      Data Filter
      <hr/>
      {onClickPredict &&
      <Tooltip placement="top" title="Predict an input">
        <Button onClick={onClickPredict} icon="caret-right" style={style} size="small">
          Predict
        </Button>
      </Tooltip>
      }
      {onClickClear &&
      <Tooltip placement="top" title="Clean the prediction">
        <Button onClick={onClickClear} icon="close" style={style} size="small">
          Clean
        </Button>
      </Tooltip>
      }
      <Tooltip placement="top" title="Filter using range sliders">
        <Button onClick={onClickFilter} type="primary" icon="upload" style={style} size="small">
          Filter
        </Button>
      </Tooltip>
    </div>
  );
}

export type FilterType = number[] | null;

export interface CategoricalInputProps {
  categories: string[];
  checkedList: number[] | null;
  featureName: string;
  inputValue: number;
  onChange: (checkedList: number[]) => void;
}

export interface CategoricalInputState {
  checkAll: boolean;
  indeterminate: boolean;
}

export class CategoricalInput extends React.PureComponent<CategoricalInputProps, CategoricalInputState> {
  constructor(props: CategoricalInputProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onCheckAllChange = this.onCheckAllChange.bind(this);
    this.state = this.calculateState(props.checkedList || []);
  }
  calculateState(checkedList: number[]) {
    const categories = this.props.categories;
    return {
      indeterminate: checkedList.length > 0 && (checkedList.length < categories.length),
      checkAll: checkedList.length === categories.length,
    };
  }
  onChange(checkedList: number[]) {
    this.setState(this.calculateState(checkedList));
    this.props.onChange(checkedList);
  }
  onCheckAllChange(checked: boolean) {

    this.props.onChange(checked ? d3.range(this.props.categories.length) : []);
  }
  render() {
    const {categories, checkedList, featureName} = this.props;
    return (
      <div>
        <h4 style={{fontSize: 12}}>{featureName} </h4>
        <hr/>
        <div style={{ borderBottom: '1px solid #E9E9E9' }}>
          <Checkbox
            indeterminate={this.state.indeterminate}
            onChange={e => this.onCheckAllChange(e.target.checked)}
            checked={this.state.checkAll}
            style={{fontSize: 12}}
          >
            Check all
          </Checkbox>
        </div>
        <CheckboxGroup value={checkedList || []} onChange={this.onChange} >
          {categories.map((category: string, i: number) => (
            <Checkbox value={i} key={category} style={{fontSize: 12, marginLeft: 0}}>{category}</Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    );
  }
}

export interface NumericInputProps {
  // range: [number, number];
  cutPoints: number[];
  featureName: string;
  value: [number, number];
  inputValue: number;
  onChangeRange: (valueRange: [number, number]) => void;
  onChangeValue?: (value: number) => void;
}

export interface NumericInputState {
  // useRange: boolean;
  // value: number;
  // valueRange: [number, number];
}

export class NumericInput extends React.PureComponent<NumericInputProps, NumericInputState> {
  constructor(props: NumericInputProps) {
    super(props);
    this.onChangeValueRange = this.onChangeValueRange.bind(this);
    // this.handleChangeMode = this.handleChangeMode.bind(this);
    const {cutPoints} = props;
    this.state = {
      // useRange: false,
      // value: nt.mean(props.range),
      valueRange: [cutPoints[0], cutPoints[cutPoints.length - 1]],
    };
  }
  onChangeValueRange(input: [number, number]) {
    this.props.onChangeRange(input.slice(0, 2) as [number, number]);
  }
  // handleChangeMode(useRange: boolean) {
  //   this.setState({useRange});
  // }
  // componentWillReceiveProps(nextProps: NumericInputProps) {
  //   const {value} = nextProps;
  //   if (Array.isArray(value)) 
  //     this.setState({valueRange: value.slice() as [number, number]});
  //   else
  //     this.setState({value: value});
  // }
  render() {
    const {cutPoints, featureName, inputValue, onChangeValue} = this.props;
    // const {value, valueRange, useRange} = this.state;
    const r0 = cutPoints[0];
    const r1 =  cutPoints[cutPoints.length - 1];
    const step = Number(((r1 - r0) / 100).toPrecision(1));
    const style = {transform: `translate(10px, -36px) rotate(-45deg)`};
    const marks: {[key: number]: {style?: React.CSSProperties, label: string}} = {};
    // cutPoints.forEach((r) => marks[r] = {label: r.toPrecision(3), style});
    cutPoints.forEach((c) => marks[c] = {label: c.toPrecision(3), style});
    const min = Math.floor(r0 / step) * step - step;
    const max = Math.ceil(r1 / step) * step + step;
    const common = {
      step, min, max,
    };
    const param1 = {
      ...common, style: {marginTop: 24, marginBottom: 0, fontSize: 9},
      marks,
    };
    return (
      <div className="card" style={{fontSize: 12}}>
        <span>
          {featureName} 
        </span>
        <hr style={{borderColor: '#ddd', borderStyle: 'solid', marginTop: 0}}/>
          <Row>
            <Col span={6} style={{marginTop: 20}}>
              Filter
            </Col>
            <Col span={18}>
              <Slider 
                range={true}
                defaultValue={[min, max]} 
                onAfterChange={this.onChangeValueRange} 
                {...param1}
              />
            </Col>
          </Row>
          {onChangeValue &&
          <Row>
            <Col span={6}>
              Input
            </Col>
            <Col span={18}>
              <Slider 
                // style={{marginTop: }}
                included={false}
                range={false} 
                value={inputValue} 
                {...common} 
                onChange={onChangeValue} 
              />
            </Col>
          </Row>
          }
      </div>
    );
  }
}

export interface DataFilterHeaderProps {
  onClick?: () => void;
}

export function DataFilterHeader(props: DataFilterHeaderProps) {
  const {onClick} = props;
  return (
    <div>
      Input
      <Button onClick={onClick} type="primary" icon="upload" style={{float: 'right', fontSize: 12}} size="small">
        Predict
      </Button>
    </div>
  );
}

interface ListData {
  featureName: string;
  idx: number;
  categories: string[] | null;
  cutPoints: number[];
}

function computeListData(meta: ModelMeta, indices?: number[]): ListData[] {
  const {categories, ranges, discretizers, featureNames} = meta;
  if (indices === undefined) indices = d3.range(featureNames.length);
  return indices.map((i: number) => {
    const cutPoints = discretizers[i].cutPoints;
    return {
      featureName: featureNames[i], categories: categories[i], 
      cutPoints: [ranges[i][0], ...(cutPoints ? cutPoints : []), ranges[i][1]],
      idx: i
    };
  });
}

export interface DataFilterProps {
  meta: ModelMeta;
  indices?: number[];
  filters: (number[] | null)[];
  // data?: number[];
  onChangeFilter: (i: number, filter: number[] | null) => void;
  onPredict?: (input: number[] | null) => void;
  onSubmitFilter?: () => void;
}

export interface DataFilterState {
  listData: ListData[];
  data: number[];
  // conditionList: (string[] | number | [number, number])[];
}

export default class DataFilter extends React.Component<DataFilterProps, DataFilterState> {
  
  // public static resetState(meta: ModelMeta) {
  //   const { categories, ranges } = meta;
  //   return {
  //     conditionList: categories.map((category, i: number) => category ? category.slice(0, 1) : nt.mean(ranges[i]))
  //   };
  // }

  constructor(props: DataFilterProps) {
    super(props);
    // this.onChangeCategories = this.onChangeCategories.bind(this);
    // this.onChangeNumeric = this.onChangeNumeric.bind(this);
    const listData = computeListData(props.meta, props.indices);
    const data = new Array(Math.max(...props.indices) + 1).fill(null); 
    listData.forEach(({cutPoints, categories, idx}) => {
      data[idx] = categories ? 0 : ((cutPoints[cutPoints.length - 1] + cutPoints[0]) / 2);
    });
    this.state = {listData, data};
    this.handleChangeData = this.handleChangeData.bind(this);
    // this.state = DataFilter.resetState(props.meta);
  }

  componentWillReceiveProps(nextProps: DataFilterProps) {
    const {meta, indices} = nextProps;
    if (meta !== this.props.meta || indices !== this.props.indices) {
      this.setState({listData: computeListData(meta, indices)});
    }
  }

  handleChangeData(idx: number, value: number) {
    const data = this.state.data;
    this.setState({data: [...data.slice(0, idx), value, ...data.slice(idx + 1)]});
  }

  render() {
    const { filters, onChangeFilter, onSubmitFilter, onPredict } = this.props;
    const data = this.state.data;
    return (
      <div>
        <Col>
          <Row>
            <DataInputHeader 
              onClickFilter={onSubmitFilter} 
              onClickPredict={onPredict && (() => onPredict(this.state.data))}
              onClickClear={onPredict && (() => onPredict(null))}
            />
          </Row>
          <Divider style={{marginTop: 8, marginBottom: 0}}/>
          <Row>
            <List
              className="scrolling-wrapper"
              // itemLayout="vertical"
              dataSource={this.state.listData}
              size="small"
              renderItem={(item: ListData) => (
                <List.Item key={item.idx} style={{paddingBottom: 0}}>
                  {item.categories &&
                    <CategoricalInput 
                      featureName={item.featureName}
                      categories={item.categories} 
                      checkedList={filters[item.idx]} 
                      onChange={(checkedList: number[]) => onChangeFilter(item.idx, checkedList)}
                      inputValue={data[item.idx]}
                    />
                  }
                  {!item.categories &&
                    <NumericInput 
                      featureName={item.featureName}
                      // range={ranges[i]}
                      cutPoints={item.cutPoints}
                      value={filters[item.idx] as [number, number]}
                      onChangeRange={(valueRange: [number, number]) => onChangeFilter(item.idx, valueRange)}
                      inputValue={data[item.idx]}
                      onChangeValue={(value: number) => this.handleChangeData(item.idx, value)}
                    />
                  }
                </List.Item>
              )}
            />
          </Row>
        </Col>
      </div>
    );

      // {featureNames.map((featureName: string, i: number) => {
      //   const category = categories[i];
      //   const cutPoints = discretizers[i].cutPoints;
      //   return (
      //     <Col className="card" key={i} span={4}>
      //       {/* <h4>{featureName}</h4> */}
      //       {/* <hr/> */}
      //       <Card bordered={true} type="inner" bodyStyle={{padding: 8}}>
      //         {category &&
      //           <CategoricalInput 
      //             featureName={featureName}
      //             categories={category} 
      //             checkedList={conditionList[i] as string[]} 
      //             onChange={(checkedList: string[]) => this.onChangeCategories(i, checkedList)}
      //           />
      //         }
      //         {!category && cutPoints &&
      //           <NumericInput 
      //             featureName={featureName}
      //             range={ranges[i]}
      //             cutPoints={cutPoints}
      //             value={conditionList[i] as (number | [number, number])}
      //             onChange={(value: number | [number, number]) => this.onChangeNumeric(i, value)}
      //           />
      //         }
      //       </Card>
      //     </Col>
      //   );
      // })}
      // </Row>
  }
}
