import { useState, useEffect } from "react";

export default function useInteractors(createInteractors) {
  const [interactors] = useState(() => createInteractors());

  useEffect(
    () => () =>
      Object.keys(interactors).forEach((key) => {
        interactors[key].destroy();
      }),
    []
  );

  const [state, setState] = useState(() => {
    return Object.keys(interactors)
      .map((childInteractorKey) => [
        childInteractorKey,
        interactors[childInteractorKey].getState(),
      ])
      .reduce((composedState, [childInteractorKey, childInteractorState]) => {
        composedState[childInteractorKey] = childInteractorState;
        return composedState;
      }, {});
  });

  useEffect(() => {
    const disconnects = Object.keys(interactors).map((childInteractorKey) => {
      return interactors[childInteractorKey].connect((childInteractorState) => {
        setState((state) => ({
          ...state,
          [childInteractorKey]: childInteractorState,
        }));
      });
    });

    return () => disconnects.forEach((disconnect) => disconnect());
  }, [interactors, setState]);

  return Object.keys(interactors)
    .map((childInteractorKey) => [
      childInteractorKey,
      state[childInteractorKey],
    ])
    .reduce(
      (composedInteractor, [childInteractorKey, childInteractorState]) => {
        composedInteractor[childInteractorKey] = {
          ...interactors[childInteractorKey],
          state: childInteractorState,
        };
        return composedInteractor;
      },
      {}
    );
}
