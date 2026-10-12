"use client";

import dynamic from "next/dynamic";
import { VegaEmbed } from "react-vega";
import type { VisualizationSpec, EmbedOptions } from "vega-embed";

const options: EmbedOptions = { mode: "vega-lite" };

export function VegaLiteChart({ spec }: { spec: VisualizationSpec }) {
  return (
    <div className="flex justify-center w-full">
      <VegaEmbed spec={spec} options={options} />
    </div>
  );
}

export default dynamic(() => Promise.resolve(VegaLiteChart), {
  ssr: false,
});
