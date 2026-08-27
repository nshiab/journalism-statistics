/** Convert a record of equally sized columns into row objects for test fixtures. */
export default function columnsToRows<
  T extends Record<string, readonly unknown[]>,
>(columns: T): Array<{ [K in keyof T]: T[K][number] }> {
  const keys = Object.keys(columns) as Array<keyof T>;
  const rowCount = keys.length === 0 ? 0 : columns[keys[0]].length;

  if (keys.some((key) => columns[key].length !== rowCount)) {
    throw new Error("All fixture columns must have the same length.");
  }

  return Array.from({ length: rowCount }, (_, index) => {
    const row = {} as { [K in keyof T]: T[K][number] };
    for (const key of keys) row[key] = columns[key][index];
    return row;
  });
}
