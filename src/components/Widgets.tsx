import * as React from 'react';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';
import './Widgets.css';

const SliderWithTooltip = createSliderWithTooltip(Slider);

export interface FloatSliderOptionalProps {
  showValue: boolean;
  min: number;
  max: number;
  step: number;
  delay: number;
}

export interface FloatSliderProps extends Partial<FloatSliderOptionalProps> {
  description?: string;
  marks?: { number?: string };
  onChange?: (value: number) => any;
  value?: number;
}

export interface FloatSliderState {
  value: number;
}

export class FloatSlider extends React.Component<FloatSliderProps, FloatSliderState> {
  public static defaultProps: Partial<FloatSliderProps> & FloatSliderOptionalProps = {
    min: 0.0,
    max: 1.0,
    step: 0.01,
    showValue: true,
    delay: 300
  };
  constructor(props: FloatSliderProps) {
    super(props);

    this.state = {
      value: 0
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.onSubmitChange = this.onSubmitChange.bind(this);
  }

  public onSubmitChange(value: number) {
    const { onChange, delay } = this.props;
    if (onChange) {
      setTimeout(() => onChange(value), delay);
    }
  }

  public onSliderChange(value: number) {
    this.setState({ value });
  }

  public onInputChange(e: any) {
    this.setState({ value: e.target.value });
    this.onSubmitChange(e.target.value);
  }

  public render() {
    const { min, max, step, description, showValue, marks } = this.props;
    const value = this.props.value === undefined ? this.state.value : this.props.value;
    return (
      <div className="rm-slider" style={{ display: 'table', clear: 'both', width: 300, margin: '8px 16px' }}>
        {description && <div style={{ float: 'left', width: '30%' }}>{description}</div>}
        <div style={{ width: '46%', float: 'left', marginTop: '8' }}>
          <SliderWithTooltip
            min={min}
            max={max}
            step={step}
            marks={marks}
            value={value}
            onChange={this.onSliderChange}
            onAfterChange={this.onSubmitChange}
          />
        </div>
        {showValue && (
          <div style={{ width: '20%', float: 'right' }}>
            <input
              type="number"
              style={{ width: 40, height: 20 }}
              step={step}
              value={value}
              onChange={this.onInputChange}
            />
          </div>
        )}
      </div>
    );
  }
}

export interface WidgetsProps {
  onMinSupportChange?(minSupport: number): any;
  onMinFidelityChange?(minSupport: number): any;
}

export interface WidgetsState {}

export default class Widgets extends React.Component<WidgetsProps, WidgetsState> {
  constructor(props: WidgetsProps) {
    super(props);

    this.state = {};
  }

  public render() {
    const { onMinSupportChange, onMinFidelityChange } = this.props;
    const supportMarks: { number?: string } = {};
    let marks = [0.0, 0.05, 0.1, 0.15, 0.2];
    marks.forEach(i => {
      supportMarks[i] = String(i);
    });
    const fidelityMarks: { number?: string } = {};
    marks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
    marks.forEach(i => {
      fidelityMarks[i] = String(i);
    });
    return (
      <div className="rm-widgets">
        <div style={{ float: 'left' }}>
          <FloatSlider
            description="Minimum Support"
            min={0.0}
            max={0.2}
            step={0.01}
            marks={supportMarks}
            onChange={onMinSupportChange}
          />
        </div>
        <div style={{ float: 'left' }}>
          <FloatSlider
            description="Minimum Fidelity"
            min={0.0}
            max={1.0}
            step={0.01}
            marks={fidelityMarks}
            onChange={onMinFidelityChange}
          />
        </div>
      </div>
    );
  }
}
