import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CameraPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [scanCompleted, setScanCompleted] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // Clean up video stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please make sure you have given permission and that your device has a camera.');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Create flash effect
    const flashElement = document.createElement('div');
    flashElement.className = 'flash';
    document.body.appendChild(flashElement);
    
    flashElement.classList.add('active');
    setTimeout(() => {
      flashElement.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(flashElement);
      }, 300);
    }, 100);
    
    // Get image from canvas
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    
    // Close camera
    closeCamera();
    setShowPreview(true);
  };

  const removePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setScanCompleted(false);
    setDetectedIngredients([]);
  };

  const scanPhoto = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    setScanCompleted(false);
    
    try {
      // This would be replaced with actual API call in production
      console.log('Sending image for AI analysis');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - would be replaced with actual API response
      const mockIngredients = ['Tomato', 'Onion', 'Garlic', 'Bell Pepper'];
      
      setDetectedIngredients(mockIngredients);
      setScanCompleted(true);
    } catch (err) {
      console.error('Error during AI scan:', err);
      setDetectedIngredients(['Failed to analyze image. Please try again.']);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findRecipesWithIngredients = () => {
    if (detectedIngredients.length === 0) return;
    
    // Navigate to recipes page with detected ingredients
    const ingredientsQuery = detectedIngredients.join(',');
    navigate(`/display-recipes?ingredients=${encodeURIComponent(ingredientsQuery)}`);
  };

  return (
    <>
      <section className="camera-page">
        <h1 className="text-center">Scan Ingredients</h1>
        <p className="camera-description text-center">Take a picture of your ingredients to find matching recipes.</p>
        
        {!showPreview && !showCamera && (
          <div className="camera-controls-center">
            <button id="openCameraBtn" className="camera-btn" onClick={openCamera}>
              <span className="camera-icon">📷</span>
              Open Camera
            </button>
          </div>
        )}

        {showPreview && capturedImage && (
          <div className="preview-container" id="previewContainer">
            <h2 className="text-center">Captured Image</h2>
            <div className="preview-wrapper">
              <img id="preview" src={capturedImage} alt="Captured image" />
              <div className="preview-actions">
                <button 
                  id="scanPhotoBtn" 
                  className="scan-btn"
                  onClick={scanPhoto}
                  disabled={isAnalyzing}
                >
                  <span className="scan-icon">🔍</span>
                  {isAnalyzing ? 'Analyzing...' : 'AI Scan'}
                </button>
                <button id="removePhotoBtn" className="remove-btn" onClick={removePhoto}>
                  Remove Photo
                </button>
              </div>
              
              {isAnalyzing && (
                <div className="loading-spinner" id="loadingSpinner">
                  <div className="spinner"></div>
                  <p>Analyzing image...</p>
                </div>
              )}
              
              {scanCompleted && (
                <div id="scanResults" className="scan-results">
                  <h3>Ingredients Detected:</h3>
                  <ul id="ingredientsList">
                    {detectedIngredients.length > 0 ? (
                      detectedIngredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))
                    ) : (
                      <li className="no-results">No ingredients detected. Try taking a clearer photo.</li>
                    )}
                  </ul>
                  
                  {detectedIngredients.length > 0 && (
                    <button 
                      className="btn cta-btn"
                      onClick={findRecipesWithIngredients}
                      style={{ marginTop: '20px' }}
                    >
                      Find Recipes with These Ingredients
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {showCamera && (
        <div className="camera-overlay">
          <div className="camera-container">
            <button id="closeCameraBtn" className="close-btn" onClick={closeCamera}>×</button>
            
            <div className="camera-status">
              <div className="camera-mode">PHOTO</div>
            </div>
            
            <div className="video-container" id="videoContainer">
              <video 
                id="video" 
                ref={videoRef} 
                autoPlay 
                playsInline
              ></video>
              <div className="camera-frame"></div>
              <div className="camera-grid"><div></div></div>
              <canvas id="canvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
              <button id="captureBtn" className="capture-btn" onClick={capturePhoto}></button>
            </div>
          </div>
        </div>
      )}
      
      {/* Flash effect div will be dynamically added when photo is taken */}
    </>
  );
}

export default CameraPage;
