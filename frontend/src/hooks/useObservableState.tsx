import { useEffect, useState, useRef } from "react";
import { Observable } from "rxjs";

function useSubscription<T>(
  observable$: Observable<T>,
  nextHandler: (value: T) => void
) {
  useEffect(() => {
    if (observable$) {
      const subscription = observable$.subscribe({
        next: nextHandler,
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [observable$, nextHandler]);
}

export function useObservableState<T>(
  observable$: Observable<T>,
  initialState: T
) {
  const [value, setValue] = useState<T>(initialState);
  useSubscription(observable$, setValue);

  return value;
}
