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
      <section className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-center text-3xl font-bold text-primary mb-2">Scan Ingredients</h1>
        <p className="text-center text-lg text-gray-400 mb-6">Take a picture of your ingredients to find matching recipes.</p>
        <div className="flex justify-center mb-8">
          <button id="openCameraBtn" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full shadow hover:bg-primary-light transition font-semibold text-lg" onClick={openCamera}>
            <span className="text-2xl">📷</span>
            Open Camera
          </button>
        </div>
        {showPreview && (
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-center text-2xl font-semibold text-primary mb-4">Captured Image</h2>
            <div className="flex flex-col items-center">
              <img id="preview" src={capturedImage} alt="Captured image" className="rounded-lg mb-4 max-w-full max-h-96 border border-gray-700" />
              <div className="flex gap-4 mb-4">
                <button id="scanPhotoBtn" className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition font-medium disabled:opacity-60" onClick={scanPhoto} disabled={isAnalyzing}>
                  <span className="text-lg">🔍</span>
                  {isAnalyzing ? 'Analyzing...' : 'AI Scan'}
                </button>
                <button id="removePhotoBtn" className="px-5 py-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition font-medium" onClick={removePhoto}>Remove Photo</button>
              </div>
              <div id="scanResults" className={showScanResults ? 'block w-full' : 'hidden'}>
                <h3 className="text-lg font-semibold text-primary mb-2">Ingredients Detected:</h3>
                <ul id="ingredientsList" className="bg-gray-800 rounded-lg p-4 text-left">
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <span className="animate-spin inline-block w-5 h-5 border-2 border-gray-400 border-t-green-500 rounded-full"></span>
                      <p>Analyzing image...</p>
                    </div>
                  )}
                  {scanError && <li className="text-red-400 italic">Error: {scanError}</li>}
                  {!scanError && !isAnalyzing && detectedIngredients.map((ingredient, idx) => (
                    <li key={idx} className={ingredient.startsWith('No ingredients') ? 'italic text-yellow-400' : ''}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <button id="closeCameraBtn" className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-red-500 transition" onClick={closeCamera}>&times;</button>
              <div className="mb-2 text-xs text-gray-400 tracking-widest">PHOTO</div>
              <div className="relative flex flex-col items-center">
                <video id="video" ref={videoRef} autoPlay playsInline className="rounded-lg border border-gray-700 max-w-full max-h-96 bg-black" />
                <div className="absolute inset-0 border-4 border-primary rounded-lg pointer-events-none"></div>
                <canvas id="canvas" ref={canvasRef} className="hidden" />
                <button id="captureBtn" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white border-4 border-primary rounded-full shadow-lg hover:scale-105 transition" onClick={capturePhoto}></button>
              </div>
            </div>
          </div>
        )}
        <div id="flashEffect" className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${flashActive ? 'bg-white opacity-80' : 'opacity-0'}`}></div>
      </section>
    </main>
  );
}

export default CameraPage;
