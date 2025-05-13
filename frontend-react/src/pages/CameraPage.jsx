import React, { useRef, useState, useEffect } from 'react';

function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
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
    canvas.getContext('2d').drawImage(video, 0, 0);
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
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
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
        <h1 className="text-center">Scan Ingredients</h1>
        <p className="camera-description text-center">Take a picture of your ingredients to find matching recipes.</p>
        <div className="camera-controls-center">
          <button id="openCameraBtn" className="camera-btn" onClick={openCamera}>
            <span className="camera-icon">📷</span>
            Open Camera
          </button>
        </div>
        {showPreview && (
          <div className="preview-container" id="previewContainer">
            <h2 className="text-center">Captured Image</h2>
            <div className="preview-wrapper">
              <img id="preview" src={capturedImage} alt="Captured image" style={{ display: 'block' }} />
              <div className="preview-actions">
                <button id="scanPhotoBtn" className="scan-btn" onClick={scanPhoto} disabled={isAnalyzing}>
                  <span className="scan-icon">🔍</span>
                  {isAnalyzing ? 'Analyzing...' : 'AI Scan'}
                </button>
                <button id="removePhotoBtn" className="remove-btn" onClick={removePhoto}>Remove Photo</button>
              </div>
              <div id="scanResults" className="scan-results" style={{ display: showScanResults ? 'block' : 'none' }}>
                <h3>Ingredients Detected:</h3>
                <ul id="ingredientsList">
                  {isAnalyzing && (
                    <div className="loading-spinner" id="loadingSpinner" style={{ display: 'flex' }}>
                      <div className="spinner"></div>
                      <p>Analyzing image...</p>
                    </div>
                  )}
                  {scanError && <li className="error">Error: {scanError}</li>}
                  {!scanError && !isAnalyzing && detectedIngredients.map((ingredient, idx) => (
                    <li key={idx} className={ingredient.startsWith('No ingredients') ? 'no-results' : ''}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {showCamera && (
          <div className="camera-overlay" id="cameraOverlay" style={{ display: 'flex' }}>
            <div className="camera-container">
              <button id="closeCameraBtn" className="close-btn" onClick={closeCamera}>×</button>
              <div className="camera-status">
                <div className="camera-mode">PHOTO</div>
              </div>
              <div className="video-container" id="videoContainer">
                <video id="video" ref={videoRef} autoPlay playsInline></video>
                <div className="camera-frame"></div>
                <div className="camera-grid"><div></div></div>
                <canvas id="canvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
                <button id="captureBtn" className="capture-btn" onClick={capturePhoto}></button>
              </div>
            </div>
          </div>
        )}
        <div id="flashEffect" className={`flash${flashActive ? ' active' : ''}`}></div>
      </section>
    </main>
  );
}

export default CameraPage;
