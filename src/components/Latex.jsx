import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Modern LaTeX renderer for React 19.
 * Uses core KaTeX for maximum stability.
 */
export default function Latex({ children, style, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !children) return;

    let text = children.toString();
    
    // 1. Normalize unicode superscripts to standard LaTeX
    const superscripts = {
      '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', 
      '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
      '⁺': '^+', '⁻': '^-', '⁼': '^=', '⁽': '^(', '⁾': '^)'
    };
    
    Object.keys(superscripts).forEach(key => {
      text = text.split(key).join(superscripts[key]);
    });

    // 2. Parse and build content with manual delimiters ($ and $$)
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
    
    containerRef.current.innerHTML = ''; // Start fresh

    parts.forEach(part => {
      if (!part) return;

      const span = document.createElement('span');
      
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          katex.render(math, span, { displayMode: true, throwOnError: false });
        } catch (e) {
          span.textContent = part;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.textContent = part;
        }
      } else {
        // Just text
        span.textContent = part;
      }
      
      containerRef.current.appendChild(span);
    });
  }, [children]);

  return (
    <span 
      ref={containerRef} 
      className={className} 
      style={{ display: 'inline-block', ...style }} 
    />
  );
}
