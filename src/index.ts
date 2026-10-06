import { getSandbox } from "@cloudflare/sandbox";
import { problems, type ProblemSlug } from "./problems";
import { buildProgram, pythonHarness, type Language } from "./harness";
import { compareResults } from "./compare";
export { Sandbox } from "@cloudflare/sandbox";
type Test = { args: unknown[]; expected: unknown };
const languages = new Set<Language>(["Python", "Java", "C++", "C#"]);
const marker = "CODINGDOLPHIN_TEST:";


function response(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/run") return response("Not found", 404);
    if (request.method !== "POST") return response("Use POST", 405);

    // Fail closed until a token is configured. Never put this token in browser code.
    const token = (env as Env & { RUNNER_TOKEN?: string }).RUNNER_TOKEN;
    if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
      return response("Unauthorized", 401);
    }

    if (Number(request.headers.get("content-length") || 0) > 25_000) {
      return response("Request too large", 413);
    }
    const raw = await request.text();
    if (raw.length > 25_000) return response("Request too large", 413);

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return response("Invalid JSON", 400);
    }
    if (!payload || typeof payload !== "object")
      return response("Invalid request", 400);
    const { language, problem, code } = payload as Record<string, unknown>;
    if (
      typeof language !== "string" ||
      !languages.has(language as Language) ||
      typeof problem !== "string" ||
      !Object.prototype.hasOwnProperty.call(problems, problem) ||
      typeof code !== "string" ||
      code.length === 0 ||
      code.length > 20_000
    ) {
      return response("Invalid language, problem, or code", 400);
    }

    const chosenLanguage = language as Language;
    const slug = problem as ProblemSlug;
    const spec = problems[slug];
    const tests = spec.tests as readonly Test[];
    const sandbox = getSandbox(env.Sandbox, `attempt-${crypto.randomUUID()}`, {
      enableDefaultSession: false,
    });

    try {
      let command: string;
      if (chosenLanguage === "Python") {
        await sandbox.writeFile("/workspace/solution.py", code);
        await sandbox.writeFile("/workspace/tests.json", JSON.stringify(spec));
        await sandbox.writeFile("/workspace/check.py", pythonHarness());
        command = "python3 -I check.py";
      } else if (chosenLanguage === "Java") {
        await sandbox.writeFile(
          "/workspace/Solution.java",
          buildProgram("Java", slug, code),
        );
        command = "javac Solution.java && java Main";
      } else if (chosenLanguage === "C++") {
        await sandbox.writeFile(
          "/workspace/solution.cpp",
          buildProgram("C++", slug, code),
        );
        command = "g++ -std=c++17 -O0 solution.cpp -o solution && ./solution";
      } else {
        await sandbox.writeFile(
          "/workspace/Runner.csproj",
          '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>',
        );
        await sandbox.writeFile(
          "/workspace/Program.cs",
          buildProgram("C#", slug, code),
        );
        command =
          "dotnet run --project Runner.csproj --configuration Release --verbosity quiet";
      }

      const result = await sandbox.exec(command, {
        cwd: "/workspace",
        timeout: 20_000,
        env: {
          DOTNET_CLI_TELEMETRY_OPTOUT: "1",
          DOTNET_NOLOGO: "1",
          DOTNET_SKIP_FIRST_TIME_EXPERIENCE: "1",
        },
      });

      const reports = result.stdout
        .split(/\r?\n/)
        .filter((line: string) => line.startsWith(marker))
        .slice(-tests.length)
        .map((line: string, index: number) => {
          try {
            const report = JSON.parse(line.slice(marker.length));
            if (
              !report ||
              typeof report !== "object" ||
              (!Object.prototype.hasOwnProperty.call(report, "actual") &&
                typeof report.error !== "string")
            )
              throw new Error("Invalid result");
            return {
              passed:
                !report.error &&
                compareResults(
                  report.actual,
                  tests[index].expected,
                  spec.comparison,
                  tests[index].args,
                ),
              actual: Object.prototype.hasOwnProperty.call(report, "actual")
                ? report.actual
                : null,
              error:
                typeof report.error === "string"
                  ? report.error.slice(0, 300)
                  : null,
            };
          } catch {
            return {
              passed: false,
              actual: null,
              error: "Invalid test output",
            };
          }
        });

      return Response.json({
        passed: tests.map((_, index) => reports[index]?.passed ?? false),
        actuals: tests.map((_, index) => reports[index]?.actual ?? null),
        testErrors: tests.map((_, index) => reports[index]?.error ?? null),
        error:
          result.success && reports.length === tests.length
            ? null
            : (
                result.stderr ||
                result.stdout ||
                "Execution stopped before all tests completed"
              ).slice(0, 3000),
      });
    } catch (error) {
      return response(
        error instanceof Error ? error.message.slice(0, 300) : "Runner failed",
        500,
      );
    } finally {
      await sandbox.destroy().catch(() => {});
    }
  },
};
