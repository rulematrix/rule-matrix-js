import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import DataTable from './DataTable';
import { labelColor } from './components/Painters/Painter';
import { RuleList } from './models/ruleModel';
import { Streams, Support, SupportMat, createStreams } from './models/data';

// import * as fs from 'fs';
import RuleMatrixApp, { RuleMatrixStyles } from './RuleMatrixApp';

const input = null;
const styles: RuleMatrixStyles = {
  flowWidth: 30,
  // mode: 'matrix',
  rectWidth: 45,
  rectHeight: 27,
  color: labelColor,
  displayEvidence: true,
  // height: 5000,
  // width: 5000,
  // displayFidelity: false,
  // displayFlow: false,
  zoomable: false
};
const model: RuleList = new RuleList(require('./test_data/model.json'));
const streams: Streams = createStreams(require('./test_data/stream.json'));
// const streams: ConditionalStreams = createConditionalStreams(require('./test_data/stream_cond.json'));
// const support: Support | SupportMat = require('./test_data/support.json');
const support: Support | SupportMat = require('./test_data/support_mat.json');
model.support(support);

ReactDOM.render(
  <div>
    <div style={{ width: 800, height: 600, overflow: 'scroll' }}>
      <RuleMatrixApp
        model={model}
        streams={streams}
        support={support}
        styles={styles}
        input={input}
        widgets={true}
        id="rm-1"
      />
    </div>
    <div style={{ width: 800, height: 600, overflow: 'scroll' }}>
      <RuleMatrixApp
        model={model}
        streams={streams}
        support={support}
        styles={styles}
        input={input}
        widgets={true}
        id="rm-2"
      />
    </div>
  </div>,
  document.getElementById('root') as HTMLElement
);
