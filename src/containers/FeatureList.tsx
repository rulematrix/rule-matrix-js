import FeatureList from '../components/FeatureList';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { RootState, getFeatureStates, FeatureState, FeatureStatus, Dispatch, selectFeature } from '../store';

type RuleListStateProp = {
  featureStatus?(i: number): FeatureStatus,
};

const mapStateToProps = (state: RootState): RuleListStateProp => {
  return {
    featureStatus: (i: number) => {
      const f = getFeatureStates(state).find((v: FeatureState) => v.idx === i);
      return f ? f.status : FeatureStatus.DEFAULT;
    }
  };
};

type FeatureListDispatchProp = {
  selectFeature?: ({ idx, deselect }: { idx: number; deselect: boolean }) => Action;
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): FeatureListDispatchProp => {
  return {
    selectFeature: ({ idx, deselect }: { idx: number; deselect: boolean }): Action =>
      dispatch(selectFeature({idx, deselect}))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeatureList);
