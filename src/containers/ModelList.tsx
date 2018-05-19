import * as React from 'react';
import { Link } from 'react-router-dom';
import { List, Card } from 'antd';
import dataService from '../service/dataService';

export interface ModelListProps {
}

export interface ModelListState {
  modelList: string[];
}

export default class ModelList extends React.Component<ModelListProps, ModelListState> {
  constructor(props: ModelListProps) {
    super(props);

    this.state = {
      modelList: []
    };
  }
  componentDidMount() {
    dataService.getModelList().then((data) => {
      if (Array.isArray(data)) {
        this.setState({modelList: data});
      }
    });
  }
  render() {
    const {modelList} = this.state;
    return (
      // <
      <Card title="Model List" style={{ width: 600, textAlign: 'center', marginLeft: 100 }}>
        <List
          // header={<div>Header</div>}
          // footer={<div>Footer</div>}
          size="small"
          bordered={false}
          dataSource={modelList}
          renderItem={(item: string) => (
            <List.Item>
              <Link to={`/${item}`} >{item} </Link>
            </List.Item>
          )}
        />
      </Card>
    );
  }
}
