import * as d3 from 'd3';
import { Painter, defaultDuration } from './index';

interface Mask {
  x: number;
  y: number;
  id: string;
  maskWidth: number;
  maskHeight: number;
  width: number;
  height: number;
  maskOpacity: number;
}

export type MaskData = Mask | undefined;

interface OptionalParams {
  duration: number;

}

export interface RangeMaskParams extends Partial<OptionalParams> {
}

export default class RangeMaskPainter implements Painter<MaskData, OptionalParams> {
  public static defaultParams: OptionalParams = {
  //   color: defaultColor,
    duration: defaultDuration,
  //   // mode: 'overlay',
  //   // padding: 4,
  //   margin: { top: 5, bottom: 5, left: 5, right: 5 },
  //   height: 50,
  //   width: 100,
  };
  private params: RangeMaskParams & OptionalParams;
  private mask: MaskData;
  constructor() {
    this.params = {...(RangeMaskPainter.defaultParams)};
  }
  update(params: RangeMaskParams): this {
    this.params = {...(this.params), ...params};
    return this;
  }
  data(newData: MaskData): this {
    this.mask = newData;
    return this;
  }

  render<GElement extends d3.BaseType>(selector: d3.Selection<SVGElement, any, GElement, any>): this {
    // if (!this.mask) {
    //   selector.
    //   return this;
    // }
    // const {x, y, maskWidth, maskHeight, width, height, maskOpacity} = this.mask;
    const maskData = this.mask ? [this.mask] : [];

    const mask = selector.selectAll(maskData.length ? `mask#${maskData[0].id}` : `mask.range-mask`)
      .data(maskData);
    const maskEnter = mask.enter().append('mask')
      .attr('class', 'range-mask')
      .attr('id', d => d.id);

    maskEnter.append('rect').attr('class', 'mask-bg').attr('fill', 'white');
    maskEnter.append('rect').attr('class', 'mask-front').attr('fill', 'white');

    const maskUpdate = maskEnter.merge(mask);

    maskUpdate.select('rect.mask-bg').attr('width', d => d.width).attr('height', d => d.height)
      .attr('fill-opacity', d => d.maskOpacity);
    
    maskUpdate.select('rect.mask-front')
      .attr('width', d => d.maskWidth).attr('height', d => d.maskHeight)
      .attr('x', d => d.x).attr('y', d => d.y);

    mask.exit().remove();

    return this;
  }

}
