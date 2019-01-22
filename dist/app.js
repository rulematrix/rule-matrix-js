import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import DataTable from './DataTable';
import { labelColor } from './components/Painters/Painter';
import { RuleList } from './models/ruleModel';
import { createStreams } from './models/data';
// import * as fs from 'fs';
import RuleMatrixApp from './RuleMatrixApp';
var input = null;
var styles = {
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
var model = new RuleList(require('./test_data/model.json'));
var streams = createStreams(require('./test_data/stream.json'));
// const streams: ConditionalStreams = createConditionalStreams(require('./test_data/stream_cond.json'));
// const support: Support | SupportMat = require('./test_data/support.json');
var support = require('./test_data/support_mat.json');
model.support(support);
ReactDOM.render(React.createElement("div", null,
    React.createElement("div", { style: { width: 800, height: 600, overflow: 'scroll' } },
        React.createElement(RuleMatrixApp, { model: model, streams: streams, support: support, styles: styles, input: input, widgets: true, id: "rm-1" })),
    React.createElement("div", { style: { width: 800, height: 600, overflow: 'scroll' } },
        React.createElement(RuleMatrixApp, { model: model, streams: streams, support: support, styles: styles, input: input, widgets: true, id: "rm-2" }))), document.getElementById('root'));
