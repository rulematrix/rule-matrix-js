"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
// import DataTable from './DataTable';
var Painter_1 = require("./components/Painters/Painter");
var ruleModel_1 = require("./models/ruleModel");
var data_1 = require("./models/data");
// import * as fs from 'fs';
var RuleMatrixApp_1 = require("./RuleMatrixApp");
var input = null;
var styles = {
    flowWidth: 30,
    // mode: 'matrix',
    rectWidth: 45,
    rectHeight: 27,
    color: Painter_1.labelColor,
    displayEvidence: true,
    // height: 5000,
    // width: 5000,
    // displayFidelity: false,
    // displayFlow: false,
    zoomable: false
};
var model = new ruleModel_1.RuleList(require('./test_data/model.json'));
var streams = data_1.createStreams(require('./test_data/stream.json'));
// const streams: ConditionalStreams = createConditionalStreams(require('./test_data/stream_cond.json'));
// const support: Support | SupportMat = require('./test_data/support.json');
var support = require('./test_data/support_mat.json');
model.support(support);
ReactDOM.render(React.createElement("div", null,
    React.createElement("div", { style: { width: 800, height: 600, overflow: 'scroll' } },
        React.createElement(RuleMatrixApp_1.default, { model: model, streams: streams, support: support, styles: styles, input: input, widgets: true, id: "rm-1" })),
    React.createElement("div", { style: { width: 800, height: 600, overflow: 'scroll' } },
        React.createElement(RuleMatrixApp_1.default, { model: model, streams: streams, support: support, styles: styles, input: input, widgets: true, id: "rm-2" }))), document.getElementById('root'));
