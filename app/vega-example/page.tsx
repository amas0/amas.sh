import { Post } from "@/components/post";
import VegaLiteChart from "@/components/vega";

export const post = {
  date: new Date(2025),
  title: "Vega Example",
  slug: "/vega-example",
  description: "A vega post",
};

export default function Page() {
  return (
    <Post title="Vega example" date={new Date("2025")}>
      <>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum
        </p>
        <VegaLiteChart
          spec={{
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            data: {
              values: [
                { category: "A", value: 10 },
                { category: "B", value: 20 },
                { category: "C", value: 30 },
              ],
            },
            mark: "bar",
            encoding: {
              x: { field: "category", type: "nominal" },
              y: { field: "value", type: "quantitative" },
            },
          }}
        />
      </>
    </Post>
  );
}
