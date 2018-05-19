// import { Painter } from './Painter';

// type SupportData = number;

// export default class SupportPainter implements Painter<SupportData, {}> {
//   private data: SupportData[];
//   constructor(data: SupportData[]) {
//     this.data = data;
//   }

//   public update(selector: d3.Selection<SVGGElement, SupportData, any, any>) {
//     const support = this.doJoin(selector);
//     const entered = this.doEnter(support.enter());
//     this.doUpdate(entered.merge(support));
//     this.doExit(support.exit());
//   }

//   public doJoin(
//     selector: d3.Selection<SVGGElement, SupportData, any, any>
//   ): d3.Selection<SVGGElement, SupportData, any, any> {
//     return selector.selectAll<SVGGElement, SupportData>('g.support').data(this.data);
//   }

//   public doEnter(
//     entered: d3.Selection<d3.EnterElement, SupportData, any, any>
//   ): d3.Selection<SVGGElement, SupportData, any, any> {
//     const supportEnter = entered.append<SVGGElement>('g').attr('class', 'support');

//     supportEnter.append('rect');
//     return supportEnter;
//   }

//   public doUpdate(updated: d3.Selection<SVGGElement, SupportData, any, any>): void {
//     return;
//   }

//   public doExit(exited: d3.Selection<SVGGElement, SupportData, any, any>): void {
//     return;
//   }
// }
