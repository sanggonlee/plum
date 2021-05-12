import { memo, ReactElement, useCallback, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { uploadTimeseriesFile } from "api/http";
import Button from "components/Button";
import useTimeseriesPersistence from "hooks/useTimeseriesPersistence";
import useTimeseriesSubscription from "hooks/useTimeseriesSubscription";
import { SubscriptionType } from "types";

const FILE_SIZE_LIMIT = 512 * 1024 * 1024; // 512 MB

enum SubscriptionState {
  NOT_STARTED = "NOT_STARTED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
}

interface SubscriptionControlProps {
  type?: SubscriptionType;
  children: ReactElement;
}

function SubscriptionControl({
  type = SubscriptionType.MONITOR,
  children,
}: SubscriptionControlProps) {
  const { addToast } = useToasts();
  const [currentState, setCurrentState] = useState(
    SubscriptionState.NOT_STARTED
  );
  const [
    ,
    { subscribeMonitor, subscribeReplay, unsubscribe },
  ] = useTimeseriesSubscription(type);
  const [, download] = useTimeseriesPersistence();

  const _startMonitor = useCallback(() => {
    setCurrentState(SubscriptionState.RUNNING);
    subscribeMonitor();
  }, [setCurrentState, subscribeMonitor]);

  const _startReplay = useCallback(
    (fileId) => {
      setCurrentState(SubscriptionState.RUNNING);
      subscribeReplay(fileId);
    },
    [setCurrentState, subscribeReplay]
  );

  const _pause = useCallback(() => {
    setCurrentState(SubscriptionState.PAUSED);
    unsubscribe();
  }, [setCurrentState, unsubscribe]);

  const _resume = useCallback(() => {
    setCurrentState(SubscriptionState.RUNNING);
    subscribeMonitor();
  }, [setCurrentState, subscribeMonitor]);

  const _stop = useCallback(() => {
    setCurrentState(SubscriptionState.NOT_STARTED);
    unsubscribe();
    if (type === SubscriptionType.MONITOR) {
      download();
    }
  }, [type, setCurrentState, unsubscribe, download]);

  const _promptUploadFile = useCallback(() => {
    const elem = document.getElementById("replay-file-upload");
    if (!elem) {
      console.error("Element with id 'replay-file-upload' does not exist");
      return;
    }
    elem.click();
  }, []);

  const _onFileUpload = useCallback(async () => {
    const elem = document.getElementById(
      "replay-file-upload"
    ) as HTMLInputElement;
    if (!elem?.files?.length) {
      console.error("File not found");
      return;
    }
    const file = elem!.files[0];
    if (file.size > FILE_SIZE_LIMIT) {
      addToast("Cannot upload file greater than 512 MB", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    try {
      const { file_id } = await uploadTimeseriesFile(formData);
      _startReplay(file_id);
    } catch (e) {
      addToast("Error uploading file", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
  }, [addToast, _startReplay]);

  if (currentState === SubscriptionState.NOT_STARTED) {
    if (type === SubscriptionType.MONITOR) {
      return (
        <Button
          containerClassName="flex flex-col max-w-none w-full h-full justify-center items-center text-3xl text-black"
          hoverContent="Start"
          onClick={_startMonitor}
        >
          Subscription has not been started
        </Button>
      );
    } else if (type === SubscriptionType.REPLAY) {
      return (
        <Button
          containerClassName="flex flex-col max-w-none w-full h-full justify-center items-center text-3xl text-black"
          hoverContent="Upload file to start a replay"
          onClick={_promptUploadFile}
        >
          Replay not started
          <input
            id="replay-file-upload"
            className="opacity-0 w-0"
            type="file"
            onChange={_onFileUpload}
          />
        </Button>
      );
    }
  }

  const renderButtons = () => {
    switch (currentState) {
      case SubscriptionState.RUNNING:
        return (
          <div className="flex flex-row flex-initial flex-initial justify-end items-end m-2">
            <Button
              containerClassName="justify-self-end mx-2 bg-gray-200"
              onClick={_stop}
            >
              Stop
            </Button>
          </div>
        );
      case SubscriptionState.PAUSED:
        return (
          <div className="flex flex-row justify-end items-end m-2">
            <Button
              containerClassName="bg-gray-200 hover:opacity-50"
              onClick={_resume}
            >
              Resume
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const contentClass =
    currentState === SubscriptionState.PAUSED ? "opacity-25" : "opacity-100";

  return (
    <div className="flex flex-col flex-1 relative h-full">
      {renderButtons()}
      <div className={contentClass}>{children}</div>
    </div>
  );
}

export default memo(SubscriptionControl);
