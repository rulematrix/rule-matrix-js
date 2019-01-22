import * as React from 'react';
import { ColorType } from './Painters';
import './Legend.css';
export interface OptionalProps {
    labelSize: number;
    fontSize: number;
    color: ColorType;
    duration: number;
    transform: string;
}
export interface LegendProps extends Partial<OptionalProps> {
    labels: string[];
}
export interface LegendState {
}
export default class Legend extends React.PureComponent<LegendProps, LegendState> {
    static defaultProps: OptionalProps;
    private ref;
    constructor(props: LegendProps);
    update(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    render(): JSX.Element;
}
