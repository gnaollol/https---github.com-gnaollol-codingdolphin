import { getSandbox } from "@cloudflare/sandbox";
import { problems, type ProblemSlug } from "./problems";

export { Sandbox } from "@cloudflare/sandbox";

type Language = "Python" | "Java" | "C++" | "C#";
type Test = { args: readonly unknown[]; expected: unknown };
const languages = new Set<Language>(["Python", "Java", "C++", "C#"]);
const marker = "CODINGDOLPHIN_TEST:";

function response(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function intArray(value: unknown): string {
  if (!Array.isArray(value) || !value.every(Number.isInteger)) {
    throw new Error("Invalid test data");
  }
  return value.join(", ");
}

function literal(value: unknown, language: Language): string {
  if (Array.isArray(value)) {
    const items = intArray(value);
    if (language === "Java") return `new int[]{${items}}`;
    if (language === "C++") return `std::vector<int>{${items}}`;
    return `new int[]{${items}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number" && Number.isInteger(value))
    return String(value);
  throw new Error("Invalid test data");
}

function testStatement(
  language: Exclude<Language, "Python">,
  slug: ProblemSlug,
  test: Test,
): string {
  const { functionName } = problems[slug];
  const owner = language === "C++" ? "Solution::" : "Solution.";
  const call = `${owner}${functionName}(${test.args.map((arg) => literal(arg, language)).join(", ")})`;
  let comparison: string;

  if (Array.isArray(test.expected)) {
    const expected = literal(test.expected, language);
    comparison =
      language === "Java"
        ? `java.util.Arrays.equals(codingDolphinActual, ${expected})`
        : language === "C#"
          ? `System.Linq.Enumerable.SequenceEqual(codingDolphinActual, ${expected})`
          : `codingDolphinActual == ${expected}`;
  } else {
    comparison = `codingDolphinActual == ${literal(test.expected, language)}`;
  }

  if (language === "Java") {
    const format = Array.isArray(test.expected)
      ? "java.util.Arrays.toString(codingDolphinActual)"
      : "String.valueOf(codingDolphinActual)";
    return `try { var codingDolphinActual = ${call}; boolean codingDolphinPassed = ${comparison}; System.out.println("${marker}{\\"passed\\":" + codingDolphinPassed + ",\\"actual\\":" + ${format} + "}"); } catch (Throwable e) { System.out.println("${marker}{\\"passed\\":false,\\"error\\":\\"Runtime error\\"}"); }`;
  }
  if (language === "C#") {
    return `try { var codingDolphinActual = ${call}; bool codingDolphinPassed = ${comparison}; System.Console.WriteLine("${marker}{\\"passed\\":" + (codingDolphinPassed ? "true" : "false") + ",\\"actual\\":" + System.Text.Json.JsonSerializer.Serialize(codingDolphinActual) + "}"); } catch (System.Exception) { System.Console.WriteLine("${marker}{\\"passed\\":false,\\"error\\":\\"Runtime error\\"}"); }`;
  }
  return `try { auto codingDolphinActual = ${call}; bool codingDolphinPassed = ${comparison}; std::cout << "${marker}{\\"passed\\":" << (codingDolphinPassed ? "true" : "false") << ",\\"actual\\":" << codingDolphinJson(codingDolphinActual) << "}" << std::endl; } catch (...) { std::cout << "${marker}{\\"passed\\":false,\\"error\\":\\"Runtime error\\"}" << std::endl; }`;
}

const cppJsonHelper = `std::string codingDolphinJson(int n) { return std::to_string(n); }
std::string codingDolphinJson(bool b) { return b ? "true" : "false"; }
std::string codingDolphinJson(const std::vector<int>& values) {
  std::string json = "[";
  for (size_t i = 0; i < values.size(); ++i) {
    if (i) json += ",";
    json += std::to_string(values[i]);
  }
  return json + "]";
}`;

function pythonHarness(): string {
  return `import contextlib
import io
import json

with open('/workspace/tests.json', encoding='utf-8') as f:
    suite = json.load(f)

namespace = {}
with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
    with open('/workspace/solution.py', encoding='utf-8') as f:
        exec(compile(f.read(), 'solution.py', 'exec'), namespace)

for test in suite['tests']:
    try:
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = namespace[suite['functionName']](*test['args'])
        passed = type(result) is type(test['expected']) and result == test['expected']
        report = {'passed': passed, 'actual': result}
        json.dumps(report)
    except BaseException:
        report = {'passed': False, 'error': 'Runtime error or unsupported return value'}
    print('${marker}' + json.dumps(report, separators=(',', ':')))
`;
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
        const statements = tests.map((test) =>
          testStatement("Java", slug, test),
        );
        await sandbox.writeFile(
          "/workspace/Solution.java",
          `${code}\nclass Main { public static void main(String[] args) {\n${statements.join("\n")}\n} }\n`,
        );
        command = "javac Solution.java && java Main";
      } else if (chosenLanguage === "C++") {
        const statements = tests.map((test) =>
          testStatement("C++", slug, test),
        );
        await sandbox.writeFile(
          "/workspace/solution.cpp",
          `#include <iostream>\n#include <vector>\n#include <string>\n${code}\n${cppJsonHelper}\nint main() {\n${statements.join("\n")}\n}\n`,
        );
        command = "g++ -std=c++17 -O0 solution.cpp -o solution && ./solution";
      } else {
        const statements = tests.map((test) => testStatement("C#", slug, test));
        await sandbox.writeFile(
          "/workspace/Runner.csproj",
          '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>',
        );
        await sandbox.writeFile(
          "/workspace/Program.cs",
          `${code}\npublic static class Program { public static void Main() {\n${statements.join("\n")}\n} }\n`,
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
        .map((line: string) => {
          try {
            const report = JSON.parse(line.slice(marker.length));
            if (typeof report.passed !== "boolean")
              throw new Error("Invalid result");
            return {
              passed: report.passed,
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
      await sandbox.destroy().catch(() => { });

    }
  },
};
