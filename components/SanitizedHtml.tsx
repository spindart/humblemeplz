import React from 'react';
import DOMPurify from 'dompurify';

interface SanitizedHtmlProps {
  html: string;
  className?: string;
}

const SanitizedHtml: React.FC<SanitizedHtmlProps> = ({ html, className }) => {
  // Configure DOMPurify to allow basic tags
  if (typeof window !== 'undefined') {
    DOMPurify.setConfig({
      ALLOWED_TAGS: ['b', 'br', 'p', 'strong', 'em', 'i', 'u', 'span', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['class', 'style']
    });
  }

  // Sanitize the HTML
  const sanitizedHtml = typeof window !== 'undefined' 
    ? DOMPurify.sanitize(html)
    : html;

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SanitizedHtml;