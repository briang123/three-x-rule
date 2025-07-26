'use client';

import React from 'react';
import { EnhancedLineSelectionExample } from '../../../components/TextHighlighterExample';

export default function TestHighlighterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enhanced Text Highlighter Demo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the enhanced line-based selection and color persistence features, similar to
            the Wes Bos website. Select any part of a line to highlight the entire line. Colors
            automatically cycle between light blue, light green, and light purple.
          </p>
        </div>

        <EnhancedLineSelectionExample />
      </div>
    </div>
  );
}
