import { ReactElement, useState } from "react";
import Button from "components/Button";
import useTimeseriesSubscription from "hooks/useTimeseriesSubscription";

enum SubscriptionState {
  NOT_STARTED = "NOT_STARTED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
}

interface SubscriptionControlProps {
  children: ReactElement;
}

export default function SubscriptionControl({
  children,
}: SubscriptionControlProps) {
  const [currentState, setCurrentState] = useState(
    SubscriptionState.NOT_STARTED
  );
  const [, { subscribe, unsubscribe }] = useTimeseriesSubscription();

  const _start = () => {
    setCurrentState(SubscriptionState.RUNNING);
    subscribe();
  };

  const _pause = () => {
    setCurrentState(SubscriptionState.PAUSED);
    unsubscribe();
  };

  if (currentState === SubscriptionState.NOT_STARTED) {
    return (
        <Button
          containerClassName="flex flex-col max-w-none w-full h-full justify-center items-center text-3xl text-black"
          hoverContent="Start"
          onClick={_start}
        >
          Subscription has not been started.
        </Button>
      );
  }

  const renderButtons = () => {
      switch(currentState) {
        case SubscriptionState.RUNNING:
            return (
                <div className="flex flex-row flex-initial flex-initial justify-end items-end m-2">
                <Button
                  containerClassName="justify-self-end bg-gray-200"
                  onClick={_pause}
                >
                  Pause
                </Button>
              </div>
            )
        case SubscriptionState.PAUSED:
            return (
                <div className="flex flex-row justify-end items-end m-2">
                <Button
                  containerClassName="bg-gray-200 hover:opacity-50"
                  onClick={_start}
                >
                  Resume
                </Button>
              </div>
            )
        default:
            return null;
      }
  };

  const contentClass = currentState === SubscriptionState.PAUSED ? "opacity-25" : "opacity-100";

  return (
        <div className="flex flex-col flex-1 relative h-full">
            {renderButtons()}
            <div className={contentClass}>
                {children}
            </div>
        </div>
  );
}
