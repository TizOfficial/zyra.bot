export function snowflakeToTimestamp(snowflake) {
  return Number(BigInt(snowflake) >> 22n) + 1420070400000;
}
