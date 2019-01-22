import * as React from 'react';
import { RuleList, Streams, ConditionalStreams } from '../../models';
import './index.css';
import { ColorType } from '../Painters/Painter';
import RuleMatrixPainter from './Painter';
export interface RuleMatrixPropsOptional {
    transform: string;
    flowWidth: number;
    evidenceWidth: number;
    rectWidth: number;
    rectHeight: number;
    displayFlow: boolean;
    displayEvidence: boolean;
    zoomable: boolean;
    color: ColorType;
    minSupport: number;
    minFidelity: number;
    intervalY: number;
    intervalX: number;
    width: number;
    height: number;
    x0: number;
    y0: number;
}
export interface RuleMatrixProps extends Partial<RuleMatrixPropsOptional> {
    model: RuleList;
    support: number[][] | number[][][];
    streams?: Streams | ConditionalStreams;
    input?: number[] | null;
}
export interface RuleMatrixState {
    painter: RuleMatrixPainter;
}
export default class RuleMatrix extends React.PureComponent<RuleMatrixProps, RuleMatrixState> {
    static defaultProps: Partial<RuleMatrixProps> & RuleMatrixPropsOptional;
    private ref;
    constructor(props: RuleMatrixProps);
    componentDidUpdate(): void;
    componentDidMount(): void;
    painterUpdate(): void;
    render(): JSX.Element;
}
