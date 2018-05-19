import RuleList from '../components/RuleList';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { Streams, ConditionalStreams } from '../models/data';
import { 
  RuleStyles, Settings, getSettings,
  RootState, Dispatch, selectFeature, FeatureStatus, getFeatureStates, FeatureState, getStreams
} from '../store';

type RuleListStateProp = {
  styles?: RuleStyles,
  settings?: Settings,
  support: number[][] | number[][][] | null,
  streams?: Streams | ConditionalStreams,
  input: number[] | null,
  featureStatus(i: number): FeatureStatus,
};

const mapStateToProps = (state: RootState): RuleListStateProp => {
  // console.log("remapped"); // tslint:disable-line

  return {
    styles: state.ruleStyles,
    settings: getSettings(state),
    support: state.support.support,
    featureStatus: (i: number) => {
      const f = getFeatureStates(state).find((v: FeatureState) => v.idx === i);
      return f ? f.status : FeatureStatus.DEFAULT;
    },
    streams: getStreams(state),
    input: state.input,
  };
};

type RuleListDispatchProp = {
  selectFeature: ({ idx, deselect }: { idx: number; deselect: boolean }) => Action;
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any): RuleListDispatchProp => {
  return {
    selectFeature: ({ idx, deselect }: { idx: number; deselect: boolean }): Action =>
      dispatch(selectFeature({idx, deselect}))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RuleList);
