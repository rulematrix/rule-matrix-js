import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './app.css';

// import DataTable from './DataTable';
import { labelColor } from './components/Painters/Painter';
import { RuleList } from './models/ruleModel';
import { Streams, Support, SupportMat, createStreams } from './models/data';

// import * as fs from 'fs';
import RuleMatrixApp from './RuleMatrixApp';

const input = null;
const styles = {
  flowWidth: 50,
  // mode: 'matrix',
  rectWidth: 45,
  rectHeight: 27,
  color: labelColor,
};
const model: RuleList = new RuleList(require('./test_data/model.json'));
const streams: Streams = createStreams(require('./test_data/stream.json'));
// const streams: ConditionalStreams = createConditionalStreams(require('./test_data/stream_cond.json'));
// const support: Support | SupportMat = require('./test_data/support.json');
const support: Support | SupportMat = require('./test_data/support_mat.json');
model.support(support);

ReactDOM.render(
  <div>
    <RuleMatrixApp model={model} streams={streams} support={support} styles={styles} input={input}/>
  </div>,
  document.getElementById('root') as HTMLElement
);
