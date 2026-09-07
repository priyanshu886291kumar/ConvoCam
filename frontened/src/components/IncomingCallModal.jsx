import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import Avatar from "./Avatar";

const IncomingCallModal = ({ caller, onAccept, onDecline }) => {
  const audioContextRef = useRef(null);
  const oscillatorIntervalRef = useRef(null);

  // Play a pleasant synthesizer phone ringtone using Web Audio API
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const playChime = () => {
          if (ctx.state === "suspended") ctx.resume();
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(480, ctx.currentTime);

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 1.2);
          osc2.stop(ctx.currentTime + 1.2);
        };

        playChime();
        oscillatorIntervalRef.current = setInterval(playChime, 2500);
      }
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }

    return () => {
      if (oscillatorIntervalRef.current) clearInterval(oscillatorIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-2xl border border-primary/30 p-6 flex flex-col items-center text-center">
        {/* Pulsing Avatar */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-full bg-primary/30 animate-ping" />
          <Avatar
            src={caller?.profilePic}
            name={caller?.fullName || "Partner"}
            size="2xl"
            ring={true}
          />
        </div>

        <h3 className="text-xl font-bold text-base-content mb-1">
          {caller?.fullName || "Language Partner"}
        </h3>
        <p className="text-sm text-primary font-medium flex items-center gap-1.5 mb-6">
          <Video className="size-4 animate-bounce" />
          Incoming Video Call...
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 w-full">
          {/* Decline */}
          <button
            onClick={onDecline}
            className="btn btn-error btn-circle size-14 shadow-lg hover:scale-110 transition-transform"
            title="Decline Call"
          >
            <PhoneOff className="size-6 text-white" />
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="btn btn-success btn-circle size-14 shadow-lg hover:scale-110 transition-transform"
            title="Accept Call"
          >
            <Phone className="size-6 text-white animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
