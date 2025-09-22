import { QueryContext, RagBundle } from "./types";

export async function planQueries(ctx: QueryContext, _bundle: RagBundle): Promise<string[]> {
  const field = ctx.field || "computer science";
  const location = ctx.location || "near me";
  const window = ctx.time_window || "next 6 months";
  const angle = ctx.angle || "community service";
  return [
    `${field} volunteer programs ${location} ${window}`,
    `${field} mentoring ${location} after school`,
    `${field} nonprofit ${location} volunteer`,
    `${field} competitions service project`,
    `${field} remote volunteer high school` ,
    `${field} hackathon community impact ${location}`,
  ];
}


