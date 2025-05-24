import React, { useRef, useState, useEffect, RefObject } from 'react';

const CameraPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanError, setScanError] = useState('');
  const [showScanResults, setShowScanResults] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
    setShowPreview(true);
    closeCamera();
    setShowScanResults(false);
    setDetectedIngredients([]);
    setScanError('');
  };

  const removePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setShowScanResults(false);
    setDetectedIngredients([]);
    setScanError('');
  };

  const scanPhoto = async () => {
    setIsAnalyzing(true);
    setShowScanResults(true);
    setDetectedIngredients([]);
    setScanError('');
    try {
      if (!capturedImage) return;
      const base64Image = capturedImage.split(',')[1];
      const response = await fetch('/api/predict/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      const result = await response.json();
      if (result.ingredients && result.ingredients.length > 0) {
        setDetectedIngredients(result.ingredients);
      } else {
        setDetectedIngredients(['No ingredients detected. Try a clearer photo.']);
      }
    } catch (err: any) {
      setScanError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCamera) {
        closeCamera();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCamera]);

  return (
    <main>
      {/* ...existing code... (JSX unchanged) */}
    </main>
  );
};

export default CameraPage;