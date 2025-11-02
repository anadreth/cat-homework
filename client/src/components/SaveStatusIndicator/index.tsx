import { useAppSelector } from "@/store/hooks";
import { selectSaveStatus, selectLastSaved } from "@/store";
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from "@remixicon/react";
import { formatRelativeTime } from "@/lib/utils/time";

export function SaveStatusIndicator() {
  const saveStatus = useAppSelector(selectSaveStatus);
  const lastSaved = useAppSelector(selectLastSaved);

  if (saveStatus === "idle" && !lastSaved) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {saveStatus === "saving" && (
        <>
          <RiLoader4Line
            size={16}
            className="animate-spin text-blue-500"
            aria-label="Saving"
          />
          <span className="text-gray-600 whitespace-nowrap">Saving...</span>
        </>
      )}

      {saveStatus === "saved" && lastSaved && (
        <>
          <RiCheckLine
            size={16}
            className="text-green-500"
            aria-label="Saved"
          />
          <span className="text-gray-600 whitespace-nowrap">
            Saved {formatRelativeTime(lastSaved)}
          </span>
        </>
      )}

      {saveStatus === "error" && (
        <>
          <RiErrorWarningLine
            size={16}
            className="text-red-500"
            aria-label="Save failed"
          />
          <span className="text-red-600 whitespace-nowrap">Save failed</span>
        </>
      )}

      {saveStatus === "idle" && lastSaved && (
        <>
          <RiCheckLine
            size={16}
            className="text-gray-400"
            aria-label="All changes saved"
          />
          <span className="text-gray-500 whitespace-nowrap">
            Saved {formatRelativeTime(lastSaved)}
          </span>
        </>
      )}
    </div>
  );
}
