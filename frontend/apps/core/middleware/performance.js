const performanceMiddleware = (namespace, color) => () => (next) => (
  action
) => {
  let startStamp;
  if (typeof performance !== "undefined") {
    startStamp = performance.now();
  }

  let result = next(action);

  if (typeof performance !== "undefined") {
    const diff = performance.now() - startStamp;

    console.log(
      `%c${namespace} [PERFORMANCE] [ACTION]`,
      `color: ${color};`,
      `${action.type} ${diff}`
    );
  }

  return result;
};

export default performanceMiddleware;
