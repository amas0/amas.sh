"use client";

import dynamic from "next/dynamic";
import { VegaLite } from "react-vega";

export function VegaLiteChart({ spec }: any) {
  return (
    <div className="flex justify-center w-full">
      <VegaLite spec={spec} />
    </div>
  );
}

export default dynamic(() => Promise.resolve(VegaLiteChart), {
  ssr: false,
});
