import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-100 to-purple-200">
      <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span className="ml-4 text-xl font-medium text-indigo-700">Loading...</span>
    </div>
  );
}
