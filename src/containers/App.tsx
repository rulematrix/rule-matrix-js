import * as React from 'react';
import { Layout, Button, Tooltip } from 'antd';
import './App.css';
// import ModelView from './ModelView';
import SideBar from './SideBar';
import Main from './Main';
// import DataTable from './DataTable';
import { introStart } from '../Guide';

const { Sider, Header } = Layout;

export interface AppProps {
  match: { params: { modelName: string } };
}

export interface AppState {
  collapsed: boolean;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      collapsed: false,
    };
    this.onCollapse = this.onCollapse.bind(this);
  }
  onCollapse(collapsed: boolean) {
    // console.log(collapsed);
    this.setState({ collapsed });
  }
  render() {
    const { match } = this.props;
    return (
      <div className="App">
        <Layout>
          <Header style={{ width: '100%', minHeight: 60 }}>
            <div className="logo">
              RuleMatrix
            </div>
            <div className="header-buttons">
              <Tooltip placement="bottom" title="Click to start the guide">
                <Button shape="circle" icon="question" style={{float: 'right'}} onClick={introStart}/>
              </Tooltip>
            </div>
            {/* Header */}
          </Header>
          <Layout>
            <Sider
              collapsible={true}
              collapsed={this.state.collapsed}
              onCollapse={this.onCollapse}
              width={300}
              collapsedWidth={80}
            >
              <SideBar collapsed={this.state.collapsed}/>
            </Sider>
            <Main modelName={match.params.modelName}/>
            {/* <Col>
              <Row>
                <ModelView modelName={match.params.modelName} />
              </Row>
            </Col> */}
              {/* </Col> */}
                {/* <Col span={1}/> */}
            {/* </Row> */}
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default App;
