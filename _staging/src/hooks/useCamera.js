import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Owns the webcam <video> stream lifecycle: enumerating devices, requesting
 * permission, starting/stopping tracks, and surfacing a clean status/error
 * for the UI to render around.
 */
export function useCamera(videoRef) {
  const [status, setStatus] = useState('idle'); // idle | starting | running | stopped | error
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const streamRef = useRef(null);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((d) => d.kind === 'videoinput'));
    } catch {
      // Non-fatal: device list is a nice-to-have for switching cameras.
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('stopped');
  }, [videoRef]);

  const start = useCallback(
    async (preferredDeviceId) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser does not support camera access.');
        setStatus('error');
        return;
      }
      setStatus('starting');
      setError(null);
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const constraints = {
          audio: false,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: preferredDeviceId ? undefined : 'user',
            deviceId: preferredDeviceId ? { exact: preferredDeviceId } : undefined,
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const track = stream.getVideoTracks()[0];
        setDeviceId(track?.getSettings?.().deviceId ?? preferredDeviceId ?? null);
        await refreshDevices();
        setStatus('running');
      } catch (err) {
        console.error('Camera start failed', err);
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera access was denied. Allow camera permission and try again.'
            : err?.name === 'NotFoundError'
              ? 'No camera was found on this device.'
              : 'Could not start the camera.',
        );
        setStatus('error');
      }
    },
    [videoRef, refreshDevices],
  );

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { status, error, devices, deviceId, start, stop, refreshDevices };
}
