export default (color, prefix) => {
  if (typeof window === "undefined") return () => {};

  return console.log.bind(console, ["%c", prefix].join(""), `color: ${color}`);
};
