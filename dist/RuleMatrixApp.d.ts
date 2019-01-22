import * as React from 'react';
import { RuleMatrixPropsOptional } from './components/RuleMatrix';
import { RuleList, ConditionalStreams, Streams, Support, SupportMat } from './models';
export declare type RuleMatrixStyles = Partial<RuleMatrixPropsOptional>;
export interface AppProps {
    id?: string;
    model?: RuleList;
    streams?: Streams | ConditionalStreams;
    support?: Support | SupportMat;
    input?: number[] | null;
    widgets?: boolean;
    styles?: RuleMatrixStyles;
}
export interface AppState {
    minSupport: number;
    minFidelity: number;
}
/**
 * RuleMatrixApp is a functional svg component that wraps RuleMatrix (which renders a group element).
 *
 * @export
 * @class RuleMatrixApp
 * @extends {React.Component<AppProps, AppState>}
 */
export default class RuleMatrixApp extends React.Component<AppProps, AppState> {
    constructor(props: AppProps);
    onMinSupportChange(value: number): void;
    onMinFidelityChange(value: number): void;
    render(): JSX.Element;
}
