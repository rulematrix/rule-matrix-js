import { createSelector } from 'reselect';
import { ModelBase, DataSet, DataTypeX, Streams, ConditionalStreams } from '../models';
import { RootState, TreeStyles, RuleStyles, FeatureState, FeatureStatus, Settings } from './state';
import { DataBaseState, StreamBase } from './index';

export const getModel = (state: RootState): ModelBase | null => state.model.model;
export const getModelIsFetching = (state: RootState): boolean => state.model.isFetching;
export const getSelectedDataNames = (state: RootState): DataTypeX[] => state.selectedData;

export const getData = (state: RootState): DataBaseState => state.dataBase;
export const getTrainData = (state: RootState): DataSet | undefined => state.dataBase.train;
export const getTestData = (state: RootState): DataSet | undefined => state.dataBase.test;

export const getRuleStyles = (state: RootState): RuleStyles => (state.ruleStyles);

export const getTreeStyles = (state: RootState): TreeStyles => (state.treeStyles);

export const getSettings = (state: RootState): Settings => (state.settings);

export const isConditional = (state: RootState): boolean => {
  return state.settings.conditional;
};

export const getFeatureStates = (state: RootState): FeatureState[] =>  
  (state.selectedFeatures);

export const getModelMeta = createSelector(
  [getModel],
  (model: ModelBase | null) => model ? model.meta : null
);

export const getActivatedFeatures = createSelector(
  [getFeatureStates],
  (featureStates: FeatureState[]): number[] => {
    return featureStates.filter((f: FeatureState) => f.status === FeatureStatus.HOVER)
    .map((f: FeatureState) => f.idx);
  }
);

export const getSelectedFeatures = createSelector(
  [getFeatureStates],
  (featureStates: FeatureState[]): number[] => {
    return featureStates.filter((f: FeatureState) => f.status === FeatureStatus.SELECT)
    .map((f: FeatureState) => f.idx);
  }
);

export const getSelectedData = createSelector(
  [getSelectedDataNames, getData],
  (dataNames: DataTypeX[], db: DataBaseState): DataSet[] => {
    const ret: (DataSet)[] = [];
    for (let dataName of dataNames) {
      const dataset = db[dataName];
      if (dataset) ret.push(dataset);
    }
    // console.log(ret); // tslint:disable-line
    return ret;
  }
);

// Fix here
export const getStreamBase = (state: RootState): StreamBase | undefined => 
  getSelectedData(state).length ? state.streamBase[getSelectedData(state)[0].name] : undefined;

export const getStreams = createSelector(
  [getSelectedData, getStreamBase, isConditional],
  (dataSets: DataSet[], streamBase: StreamBase | undefined, conditional: boolean
  ): Streams | ConditionalStreams | undefined => {
    if (dataSets.length === 0) return undefined;
    // const streamBase = streamBases[dataSets[0].name];
    if (streamBase)
      return conditional ? streamBase.conditionalStreams : streamBase.streams;
    return undefined;
  }
);

// const getColorString = (state: RootState) => state.ruleStyles.color;

// export const getColor = (state: RootState): ColorType => {
//   const model = getModel(state);
//   const color = getColorString(state);
//   if (model && color === 'sequential') return sequentialColors(model.nClasses);
//   return labelColor;
// };

// export const getModelSupport = (state: RootState): number[][] | number[][][] => {
//   const model = getModel(this.model)
// }