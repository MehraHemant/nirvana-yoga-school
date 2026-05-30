import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function iconSize(
  size: number | undefined,
  props: SVGProps<SVGSVGElement>,
) {
  return {
    width: props.width ?? size,
    height: props.height ?? size,
  };
}
