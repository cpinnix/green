export default function createTracer(log) {
  return {
    createSpan(label) {
      let startStamp;
      if (typeof performance !== "undefined") {
        startStamp = performance.now();
      }

      return () => {
        if (typeof performance !== "undefined") {
          log("[PERFORMANCE]", label, performance.now() - startStamp);
        }
      };
    },
  };
}
