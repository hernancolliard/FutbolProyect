import React, { useState, useRef, useEffect } from 'react';

const FadeInOnScroll = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // No longer need to observe the element
          observer.unobserve(entry.target);
        }
      });
    });

    const { current } = domRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;
