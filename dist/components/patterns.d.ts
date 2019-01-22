/// <reference types="react" />
import { ColorType } from './Painters/Painter';
export interface PatternsProps {
    color?: ColorType;
    labels: string[];
}
/**
 * The filling patterns used in the visualization.
 * This will render a def tag, which should be in the beginning inside of the svg.
 * @export
 * @param {PatternsProps} props
 * @returns
 */
export default function Patterns(props: PatternsProps): JSX.Element;
