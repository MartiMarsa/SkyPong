'use client';

import { Button, TextField, Chip, colors, typography, spacing } from '../ui/base';
import { useTranslation } from '../context/language-context';
import { useState } from 'react';

export default function UITestPage() {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState('');
  const [textError, setTextError] = useState('');

  return (
    <div className="min-h-dvh bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className={`${typography.heading} mb-8`}>UI Components Test Page</h1>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" href="/">Link Button</Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm text-blue-800 mb-2">With translations (from t):</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">{t.game.playButton}</Button>
              <Button variant="secondary">{t.navigation.home}</Button>
            </div>
          </div>
        </section>

        {/* TextField Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">TextField</h2>
          
          <div className="max-w-md space-y-6">
            <TextField 
              label="Username" 
              placeholder="Enter your username"
              value={textValue}
              onChange={setTextValue}
            />

            <TextField 
              label="Email" 
              type="email"
              placeholder="Enter your email"
            />

            <TextField 
              label="Password" 
              type="password"
              placeholder="Enter password"
            />

            <TextField 
              label="With Error" 
              placeholder="This field has an error"
              error="This field is required"
            />

            <TextField 
              label="Disabled" 
              placeholder="Cannot edit"
              disabled
            />
          </div>
        </section>

        {/* Chip Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Chip</h2>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Chip>Default</Chip>
            <Chip variant="success">Success</Chip>
            <Chip variant="warning">Warning</Chip>
            <Chip variant="error">Error</Chip>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">Example usage:</p>
            <div className="flex flex-wrap gap-2">
              <Chip variant="success">Online</Chip>
              <Chip variant="warning">In Game</Chip>
              <Chip variant="error">Offline</Chip>
            </div>
          </div>
        </section>

        {/* Global Styles Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Global Styles (Tailwind)</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-2">Colors</h3>
              <div className="space-y-2">
                {Object.entries(colors).map(([name, value]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-600">{name}:</span>
                    <span className={`px-3 py-1 text-sm ${value}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-2">Typography</h3>
              <div className="space-y-3">
                {Object.entries(typography).map(([name, value]) => (
                  <div key={name}>
                    <span className="text-sm text-gray-600">{name}: </span>
                    <span className={`${value}`}>Sample text</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-2">Spacing</h3>
              <div className="flex gap-4">
                {Object.entries(spacing).map(([name, value]) => (
                  <div key={name} className="text-center">
                    <div className={`${value} bg-blue-500 text-white text-xs mb-1`}>X</div>
                    <span className="text-xs text-gray-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Test Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Responsive (Resize to test)</h2>
          <div className="p-4 bg-white rounded-lg border">
            <p className={`${typography.body} mb-2`}>
              Body text: text-base md:text-lg
            </p>
            <p className={`${typography.heading} mb-2`}>
              Heading: text-xl md:text-2xl
            </p>
            <p className={`${typography.small}`}>
              Small: text-sm md:text-base
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Resize your browser to see the responsive breakpoints in action.
            </p>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p>This is a development test page. Remove when components are implemented.</p>
        </div>
      </div>
    </div>
  );
}
