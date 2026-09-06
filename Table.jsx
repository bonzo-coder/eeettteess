import React, { useState, useEffect } from 'react';

const ScissorLiftAnimation = ({ texts = [] }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  const defaultTexts = [
    "Save time on heavy lifting",
    "Let our equipment do the work",
    "Focus on what matters most",
    "Efficient lifting solutions"
  ];
  
  const displayTexts = texts.length > 0 ? texts : defaultTexts;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % displayTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [displayTexts.length]);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ 
        height: '60px', 
        marginBottom: '20px', 
        position: 'relative',
        textAlign: 'center'
      }}>
        <div key={currentTextIndex} style={{
          position: 'absolute',
          width: '100%',
          animation: 'fade 3s ease-in-out infinite',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          {displayTexts[currentTextIndex]}
        </div>
      </div>
      
      <svg viewBox="0 0 300 200" style={{ width: '100%' }}>
        {/* Base */}
        <rect x="50" y="180" width="200" height="10" fill="#555" />
        
        {/* Scissor mechanism */}
        <line 
          x1="90" y1="180" x2="150" y2="140" 
          stroke="#333" strokeWidth="4" 
          style={{ animation: 'armMove 3s ease-in-out infinite', transformOrigin: 'bottom center' }}
        />
        <line 
          x1="210" y1="180" x2="150" y2="140" 
          stroke="#333" strokeWidth="4" 
          style={{ animation: 'armMove 3s ease-in-out infinite', transformOrigin: 'bottom center' }}
        />
        
        {/* Add the rest of the SVG elements similarly */}
        
        <style>
          {`
            @keyframes fade {
              0%, 100% { opacity: 0; transform: translateY(10px); }
              20%, 80% { opacity: 1; transform: translateY(0); }
            }
            @keyframes armMove {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(10deg); }
            }
          `}
        </style>
      </svg>
    </div>
  );
};

export default ScissorLiftAnimation;