import { problems } from "./problems";
export type Language = "Python" | "Java" | "C++" | "C#";
const marker = "CODINGDOLPHIN_TEST:";
const languageTypes: Record<string, Record<string, string>> = {
  Java: {
    int: "int",
    double: "double",
    string: "String",
    bool: "boolean",
    tree: "Integer[]",
  },
  "C++": {
    int: "int",
    double: "double",
    string: "std::string",
    bool: "bool",
    tree: "std::vector<std::optional<int>>",
  },
  "C#": {
    int: "int",
    double: "double",
    string: "string",
    bool: "bool",
    tree: "int?[]",
  },
};
function typeName(type: string, language: Language): string {
  const direct = languageTypes[language][type];
  if (direct) return direct;
  if (type.endsWith("[]")) {
    const element = typeName(type.slice(0, -2), language);
    return language === "C++" ? `std::vector<${element}>` : `${element}[]`;
  }
  throw new Error("Unsupported parameter type " + type);
}
function literal(value: unknown, type: string, language: Language): string {
  if (Array.isArray(value)) {
    const child = type === "tree" ? "nullable" : type.slice(0, -2);
    const values = value.map((v) => literal(v, child, language)).join(", ");
    const name = typeName(type, language);
    return language === "C++" ? `${name}{${values}}` : `new ${name}{${values}}`;
  }
  if (value === null && type === "nullable")
    return language === "C++" ? "std::nullopt" : "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  throw new Error("Invalid test data");
}
const javaHelper = String.raw`
class CodingDolphinJson {
  static String json(Object value) {
    if (value == null) return "null";
    if (value instanceof String || value instanceof Character) {
      StringBuilder b = new StringBuilder("\"");
      for (char c : String.valueOf(value).toCharArray()) {
        if(c=='"' || c=='\\') b.append('\\').append(c);
        else if(c<32) b.append(String.format("\\u%04x",(int)c));
        else b.append(c);
      }
      return b.append('"').toString();
    }
    if(value.getClass().isArray()) {
      StringBuilder b = new StringBuilder("[");
      for(int i=0;i<java.lang.reflect.Array.getLength(value);i++) {
        if(i>0)b.append(','); b.append(json(java.lang.reflect.Array.get(value,i)));
      }
      return b.append(']').toString();
    }
    if(value instanceof Iterable<?>) {
      StringBuilder b=new StringBuilder("["); boolean first=true;
      for(Object v:(Iterable<?>)value){if(!first)b.append(',');first=false;b.append(json(v));}
      return b.append(']').toString();
    }
    if(value instanceof Number || value instanceof Boolean) return String.valueOf(value);
    throw new IllegalArgumentException("Unsupported return value");
  }
}
`;
const cppHelper = String.raw`
std::string codingDolphinJson(int value) { return std::to_string(value); }
std::string codingDolphinJson(long value) { return std::to_string(value); }
std::string codingDolphinJson(long long value) { return std::to_string(value); }
std::string codingDolphinJson(unsigned int value) { return std::to_string(value); }
std::string codingDolphinJson(double value) {
  if (!std::isfinite(value)) throw std::runtime_error("Nonfinite value");
  std::ostringstream out;
  out << std::setprecision(17) << value;
  return out.str();
}
std::string codingDolphinJson(bool value) { return value ? "true" : "false"; }
std::string codingDolphinJson(const std::string& value) {
  std::string out="\"";
  const char* hex="0123456789abcdef";
  for(unsigned char c:value) {
    if(c=='"'||c=='\\'){out+='\\';out+=c;}
    else if(c<32){out+="\\u00";out+=hex[c>>4];out+=hex[c&15];}
    else out+=c;
  }
  return out+"\"";
}
std::string codingDolphinJson(const std::optional<int>& value) { return value ? codingDolphinJson(*value) : "null"; }
template<class T> std::string codingDolphinJson(const std::vector<T>& values);
template<class T> std::string codingDolphinJson(const std::vector<T>& values) {
  std::string out = "[";
  for (size_t i = 0; i < values.size(); i++) {
    if (i) out += ",";
    out += codingDolphinJson(static_cast<T>(values[i]));
  }
  return out + "]";
}
`;
export function pythonHarness(): string {
  return `import contextlib, io, json, copy
with open('/workspace/tests.json', encoding='utf-8') as f:
    suite = json.load(f)
namespace = {}
with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
    with open('/workspace/solution.py', encoding='utf-8') as f:
        exec(compile(f.read(), 'solution.py', 'exec'), namespace)
for test in suite['tests']:
    try:
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            args = copy.deepcopy(test['args'])
            if suite['functionName'] == 'codecRoundTrip':
                actual = namespace['decode'](namespace['encode'](args[0]))
            elif suite['functionName'] == 'treeCodecRoundTrip':
                actual = namespace['deserialize'](namespace['serialize'](args[0]))
            else:
                actual = namespace[suite['functionName']](*args)
            if suite['functionName'] == 'cloneGraph' and (actual is args[0] or any(row is original for row in actual for original in args[0])):
                raise ValueError('Return an independent copy of every adjacency row')
        report = {'actual': actual}
        json.dumps(report, allow_nan=False)
    except BaseException as error:
        report = {'error': type(error).__name__ + ': ' + str(error)[:200]}
    print('${marker}' + json.dumps(report, separators=(',', ':'), allow_nan=False))
`;
}

function buildInvocation(
  language: Language,
  functionName: string,
  argumentCount: number,
): string {
  const owner = language === "C#" ? "Solution" : "solution";

  if (functionName === "codecRoundTrip") {
    return `${owner}.decode(${owner}.encode(a0))`;
  }
  if (functionName === "treeCodecRoundTrip") {
    return `${owner}.deserialize(${owner}.serialize(a0))`;
  }

  const argumentsList = Array.from(
    { length: argumentCount },
    (_, index) => `a${index}`,
  );
  return `${owner}.${functionName}(${argumentsList.join(", ")})`;
}

function buildJavaTest(
  declarations: string,
  call: string,
  copyCheck: string,
): string {
  const actualPrefix = JSON.stringify(marker + '{"actual":');
  const errorPrefix = JSON.stringify(marker + '{"error":');

  return `{
    try {
      Solution solution = new Solution();
      ${declarations}
      var actual = ${call};
      ${copyCheck}
      System.out.println(${actualPrefix} + CodingDolphinJson.json(actual) + "}");
    } catch (Throwable error) {
      System.out.println(${errorPrefix} + CodingDolphinJson.json(error.toString()) + "}");
    }
  }`;
}

function buildCSharpTest(
  declarations: string,
  call: string,
  copyCheck: string,
): string {
  const actualPrefix = JSON.stringify(marker + '{"actual":');
  const errorPrefix = JSON.stringify(marker + '{"error":');

  return `{
    try {
      ${declarations}
      var actual = ${call};
      ${copyCheck}
      System.Console.WriteLine(${actualPrefix} + System.Text.Json.JsonSerializer.Serialize(actual) + "}");
    } catch (System.Exception error) {
      System.Console.WriteLine(${errorPrefix} + System.Text.Json.JsonSerializer.Serialize(error.Message) + "}");
    }
  }`;
}

function buildCppTest(declarations: string, call: string): string {
  const actualPrefix = JSON.stringify(marker + '{"actual":');
  const errorPrefix = JSON.stringify(marker + '{"error":');
  const unknownError = JSON.stringify(marker + '{"error":"Runtime error"}');

  return `{
    try {
      Solution solution;
      ${declarations}
      auto actual = ${call};
      std::cout << ${actualPrefix} << codingDolphinJson(actual) << "}" << std::endl;
    } catch (const std::exception& error) {
      std::cout << ${errorPrefix} << codingDolphinJson(std::string(error.what())) << "}" << std::endl;
    } catch (...) {
      std::cout << ${unknownError} << std::endl;
    }
  }`;
}

// Reference-array languages must copy both the adjacency array and its rows.
function graphCopyCheck(language: Language, functionName: string): string {
  if (functionName !== "cloneGraph") return "";

  if (language === "Java") {
    return `if (actual == a0) {
      throw new IllegalArgumentException("Return an independent copy");
    }
    for (int[] row : actual) {
      for (int[] original : a0) {
        if (row == original) throw new IllegalArgumentException("Copy every adjacency row");
      }
    }`;
  }

  if (language === "C#") {
    return `if (System.Object.ReferenceEquals(actual, a0)) {
      throw new System.Exception("Return an independent copy");
    }
    foreach (var row in actual) {
      foreach (var original in a0) {
        if (System.Object.ReferenceEquals(row, original)) {
          throw new System.Exception("Copy every adjacency row");
        }
      }
    }`;
  }

  return "";
}

export function buildProgram(
  language: Exclude<Language, "Python">,
  slug: string,
  code: string,
): string {
  const problem = problems[slug];
  const tests = problem.tests
    .map((test) => {
      const declarations = test.args
        .map((argument, index) => {
          const parameterType = problem.signature.parameters[index][1];
          const type = typeName(parameterType, language);
          const value = literal(argument, parameterType, language);
          return `${type} a${index} = ${value};`;
        })
        .join("\n");

      const call = buildInvocation(
        language,
        problem.functionName,
        test.args.length,
      );
      const copyCheck = graphCopyCheck(language, problem.functionName);

      if (language === "Java")
        return buildJavaTest(declarations, call, copyCheck);
      if (language === "C#")
        return buildCSharpTest(declarations, call, copyCheck);
      return buildCppTest(declarations, call);
    })
    .join("\n");

  if (language === "Java") {
    return `${code}
${javaHelper}
class Main {
  public static void main(String[] args) {
    ${tests}
  }
}`;
  }

  if (language === "C++") {
    return `#include <bits/stdc++.h>
${code}
${cppHelper}
int main() {
  ${tests}
}`;
  }

  return `${code}
public static class Program {
  public static void Main() {
    ${tests}
  }
}`;
}
