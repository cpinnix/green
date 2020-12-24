import createLogger from "utils/createLogger";

const log = createLogger("#B9F6CA", "[PERFORMANCE]");

export default function createSpan(label) {
  let startStamp;
  if (typeof performance !== "undefined") {
    startStamp = performance.now();
  }

  return () => {
    if (typeof performance !== "undefined") {
      log(label, performance.now() - startStamp);
    }
  };
}
