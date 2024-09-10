interface Function {
  isEmpty(value: string): boolean;
  isNotEmpty(value: string): boolean;
}

String.isEmpty = function (value: string): boolean {
  return value?.trim()?.length === 0;
};

String.isNotEmpty = function (value: string): boolean {
  return value?.trim()?.length > 0;
};
