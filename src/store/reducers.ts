import { combineReducers } from 'redux';
import { isRuleModel, isTreeModel, RuleList, DataSet, DataTypeX, ConditionalStreams, Streams, Tree } from '../models';
import {
  ModelState,
  DataBaseState,
  FeatureState,
  TreeStyles,
  initTreeStyles,
  FeatureStatus,
  RuleStyles,
  initRuleStyles,
  RootState,
  Settings,
  initialSettings,
  DataFilter,
  initialStreamBaseState,
  StreamBaseState,
  SupportState,
  initSupportState,
  initDataFilter,
  Input
} from './state';
import { ReceiveStreamAction, RequestSupportAction, ActionType, ChangeFiltersAction, PredictAction } from './actions';
import { isSurrogate } from '../models/base';

import {
  ReceiveSupportAction,
  RequestModelAction,
  ReceiveModelAction,
  // RequestDatasetAction,
  ReceiveDatasetAction,
  SelectDatasetAction,
  SelectFeatureAction,
  ChangeTreeStylesAction,
  ChangeRuleStylesAction,
  ChangeSettingsAction
} from './actions';

export const initialModelState: ModelState = {
  model: null,
  isFetching: false
};

// export const initialModelBaseState: ModelBaseState = {};

export const initialDataBaseState: DataBaseState = {};

export const initialFeaturesState: FeatureState[] = [];

function modelStateReducer(
  state: ModelState = initialModelState,
  action: RequestModelAction | ReceiveModelAction | ReceiveSupportAction
): ModelState {
  switch (action.type) {
    case ActionType.REQUEST_MODEL:
      // console.log("start Fetching...");  // tslint:disable-line
      return { ...state, isFetching: true };
    case ActionType.RECEIVE_MODEL:
      // console.log("receiving model...");  // tslint:disable-line
      let model = action.model;
      if (model !== null) {
        if (isRuleModel(model)) model = new RuleList(model);
        if (isTreeModel(model)) model = new Tree(model);
      }
      return {
        isFetching: false,
        model
      };
    case ActionType.RECEIVE_SUPPORT:
      const model2 = state.model;
      if (model2 instanceof RuleList) {
        model2.support(action.support);
      }
      return {
        isFetching: false,
        model: model2
      };
    // case ActionType.CHANGE_SETTINGS:
    //   const model3 = state.model;
    //   if (model3 instanceof RuleList) {
    //     const minSupport = action.newSettings.minSupport;
    //     if (minSupport)
    //       model3.setMinSupport(minSupport);
    //   }
    //   return {
    //     isFetching: false,
    //     model: model3
    //   };
    default:
      return state;
  }
}

function dataBaseReducer(state: DataBaseState = initialDataBaseState, action: ReceiveDatasetAction): DataBaseState {
  switch (action.type) {
    case ActionType.RECEIVE_DATASET:
      const newState: DataBaseState = {};
      newState[action.dataType] = new DataSet(action.data);
      return { ...state, ...newState };

    default:
      return state;
  }
}

function streamBaseReducer(
  state: StreamBaseState = initialStreamBaseState,
  action: ReceiveStreamAction
): StreamBaseState {
  switch (action.type) {
    case ActionType.RECEIVE_STREAM:
      const streamBase: StreamBaseState[DataTypeX] = { ...state[action.dataType] };
      if (action.conditional) {
        streamBase.conditionalStreams = action.streams as ConditionalStreams;
      } else {
        streamBase.streams = action.streams as Streams;
      }
      const newState: StreamBaseState = {};
      newState[action.dataType] = streamBase;
      return { ...state, ...newState };

    default:
      return state;
  }
}

function selectDatasetReducer(state: DataTypeX[] = [], action: SelectDatasetAction): DataTypeX[] {
  switch (action.type) {
    case ActionType.SELECT_DATASET:
      return action.dataNames;
    default:
      return state;
  }
}

function selectedFeaturesReducer(
  state: FeatureState[] = initialFeaturesState,
  action: SelectFeatureAction
): FeatureState[] {
  switch (action.type) {
    case ActionType.SELECT_FEATURE:
      if (action.deselect) {
        const idx = state.findIndex((f: FeatureState) => f.idx === action.idx);
        if (idx === -1) return state;
        const feature = state[idx];
        feature.status--;
        if (feature.status < FeatureStatus.HOVER) {
          return [...state.slice(0, idx), ...state.slice(idx + 1)];
        }
        return [...state];
      } else {
        const idx = state.findIndex((f: FeatureState) => f.idx === action.idx);
        if (idx === -1) return [...state, { idx: action.idx, status: FeatureStatus.HOVER }];
        else if (state[idx].status < FeatureStatus.SELECT) {
          state[idx].status++;
        }
        return [...state];
      }
    default:
      return state;
  }
}

function treeStylesReducer(state: TreeStyles = initTreeStyles, action: ChangeTreeStylesAction): TreeStyles {
  switch (action.type) {
    case ActionType.CHANGE_TREE_STYLES:
      return { ...state, ...action.newStyles };
    default:
      return state;
  }
}

function ruleStylesReducer(state: RuleStyles = initRuleStyles, action: ChangeRuleStylesAction): RuleStyles {
  switch (action.type) {
    case ActionType.CHANGE_RULE_STYLES:
      return { ...state, ...action.newStyles };
    default:
      return state;
  }
}

function settingsReducer(
  state: Settings = initialSettings,
  action: ChangeSettingsAction | ReceiveModelAction
): Settings {
  switch (action.type) {
    case ActionType.CHANGE_SETTINGS:
      return { ...state, ...action.newSettings };
    case ActionType.RECEIVE_MODEL:
      const model = action.model;
      const supportMat = model !== null && isSurrogate(model);
      return { ...state, supportMat };
    default:
      return state;
  }
}

function supportReducer(
  state: SupportState = initSupportState,
  action: RequestSupportAction | ReceiveSupportAction
): SupportState {
  switch (action.type) {
    case ActionType.REQUEST_SUPPORT:
      return { isFetching: true, support: null };
    case ActionType.RECEIVE_SUPPORT:
      return { isFetching: false, support: action.support };
    default:
      return state;
  }
}

function filtersReducer(state: DataFilter[] = initDataFilter, action: ChangeFiltersAction): DataFilter[] {
  switch (action.type) {
    case ActionType.CHANGE_FILTERS:
      return action.newFilters;
    default:
      return state;
  }
}

function inputReducer(state: Input = null, action: PredictAction): Input {
  switch (action.type) {
    case ActionType.PREDICT:
      return action.input;
    default:
      return state;
  }
}
// function selectedDataReducer(
//   state: string,
//   action:
// )

export const rootReducer = combineReducers<RootState>({
  model: modelStateReducer,
  dataBase: dataBaseReducer,
  dataFilters: filtersReducer,
  streamBase: streamBaseReducer,
  selectedData: selectDatasetReducer,
  selectedFeatures: selectedFeaturesReducer,
  treeStyles: treeStylesReducer,
  ruleStyles: ruleStylesReducer,
  settings: settingsReducer,
  support: supportReducer,
  input: inputReducer
});
