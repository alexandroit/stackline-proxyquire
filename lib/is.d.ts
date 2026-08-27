interface Is {
  Arguments(value: unknown): value is IArguments
  Function(value: unknown): value is Function
  String(value: unknown): value is string
  Number(value: unknown): value is number
  Date(value: unknown): value is Date
  RegExp(value: unknown): value is RegExp
  Object(value: unknown): value is object
}

declare const is: Is
export = is
