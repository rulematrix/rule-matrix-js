import * as React from 'react';
import 'rc-slider/assets/index.css';
import './Widgets.css';
export interface FloatSliderOptionalProps {
    showValue: boolean;
    min: number;
    max: number;
    step: number;
    delay: number;
}
export interface FloatSliderProps extends Partial<FloatSliderOptionalProps> {
    description?: string;
    marks?: {
        number?: string;
    };
    onChange?: (value: number) => any;
    value?: number;
}
export interface FloatSliderState {
    value: number;
}
export declare class FloatSlider extends React.Component<FloatSliderProps, FloatSliderState> {
    static defaultProps: Partial<FloatSliderProps> & FloatSliderOptionalProps;
    constructor(props: FloatSliderProps);
    onSubmitChange(value: number): void;
    onSliderChange(value: number): void;
    onInputChange(e: any): void;
    render(): JSX.Element;
}
export interface WidgetsProps {
    onMinSupportChange?(minSupport: number): any;
    onMinFidelityChange?(minSupport: number): any;
}
export interface WidgetsState {
}
export default class Widgets extends React.Component<WidgetsProps, WidgetsState> {
    constructor(props: WidgetsProps);
    render(): JSX.Element;
}
