import { problemDefinitions } from "./problem-sets";
import type { ComparisonMode, ProblemSignature } from "./coding-types";

type RunnerProblem = {
  functionName: string;
  signature: ProblemSignature;
  comparison?: ComparisonMode;
  tests: { args: unknown[]; expected: unknown }[];
};

const legacySignatures: Record<string, ProblemSignature> = {
  "two-sum": {
    parameters: [
      ["nums", "int[]"],
      ["target", "int"],
    ],
    returns: "int[]",
  },
  "valid-parentheses": { parameters: [["s", "string"]], returns: "bool" },
  "binary-search": {
    parameters: [
      ["nums", "int[]"],
      ["target", "int"],
    ],
    returns: "int",
  },
};

export const problems: Record<string, RunnerProblem> = Object.fromEntries(
  problemDefinitions.map((problem) => {
    const signature = problem.signature ?? legacySignatures[problem.slug];
    if (!signature) throw new Error(`Missing signature for ${problem.slug}`);

    return [
      problem.slug,
      {
        functionName: problem.functionName,
        signature,
        comparison: problem.comparison,
        tests: problem.tests,
      },
    ];
  }),
);

export type ProblemSlug = keyof typeof problems;
