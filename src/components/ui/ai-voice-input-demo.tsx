import { useState } from "react";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";

export function AIVoiceInputDemo() {
  const [recordings, setRecordings] = useState<{ duration: number; timestamp: Date }[]>([]);

  const handleStop = (duration: number) => {
    setRecordings((prev) => [...prev.slice(-4), { duration, timestamp: new Date() }]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AIVoiceInput onStart={() => console.log("Recording started")} onStop={handleStop} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Last recordings</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          {recordings.length === 0 && <li>No recordings yet.</li>}
          {recordings.map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{item.timestamp.toLocaleTimeString()}</span>
              <span>{item.duration}s</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
