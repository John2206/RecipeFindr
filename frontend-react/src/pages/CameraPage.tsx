import React, { useRef, useState, useEffect } from 'react';

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
      <section className="camera-page">
        <h1>Ingredient Scanner</h1>
        <p className="camera-description">
          Use your camera to scan ingredients and get AI-powered recipe suggestions.
        </p>
        
        <div className="camera-controls-center">
          {!capturedImage && !showCamera && (
            <button onClick={openCamera} className="camera-btn">
              <span className="camera-icon">📷</span>
              Open Camera
            </button>
          )}
        </div>

        {/* Camera Overlay */}
        {showCamera && (
          <div className="camera-overlay">
            <div className="camera-container">
              <div className="video-container">
                <video ref={videoRef} autoPlay playsInline muted />
                <div className="camera-frame"></div>
                <div className="camera-controls">
                  <button onClick={closeCamera} className="camera-btn-close">✕</button>
                  <button onClick={capturePhoto} className="capture-btn">📷</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview */}
        {capturedImage && showPreview && (
          <div className="preview-container">
            <h3>Captured Photo</h3>
            <img src={capturedImage} alt="Captured" className="captured-image" />
            <div className="preview-controls">
              <button onClick={scanPhoto} className="btn-primary" disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Scan for Ingredients'}
              </button>
              <button onClick={removePhoto} className="btn-secondary">
                Retake Photo
              </button>
            </div>
          </div>
        )}

        {/* Scan Results */}
        {showScanResults && (
          <div className="scan-results">
            <h3>Detected Ingredients</h3>
            {scanError ? (
              <div className="error-message">{scanError}</div>
            ) : (
              <ul className="ingredients-list">
                {detectedIngredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            )}
            {detectedIngredients.length > 0 && !scanError && (
              <a href={`/recipes?ingredients=${detectedIngredients.join(',')}`} className="btn-primary">
                Find Recipes with These Ingredients
              </a>
            )}
          </div>
        )}

        {/* Flash Effect */}
        <div className={`flash ${flashActive ? 'active' : ''}`}></div>
        
        {/* Hidden Canvas for Photo Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </section>
    </main>
  );
};

export default CameraPage;