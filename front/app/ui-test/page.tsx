'use client';

import { 
  Button, 
  TextField, 
  Chip,
} from '../ui/base';
import { useTranslation } from '../context/language-context';
import { useState } from 'react';

export default function UITestPage() {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState('');
  const [textError, setTextError] = useState('');

  return (
    <div className="min-h-dvh bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-12">UI Components Test Page</h1>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Buttons</h2>
          
          <p className="text-sm text-gray-600 mb-2">Button variants (color styles)</p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" font="display">Primary</Button>
            <Button variant="secondary" font="display">Secondary</Button>
            <Button variant="danger" font="display">Danger</Button>
            <Button variant="ghost" font="display">Ghost</Button>
          </div>

          <p className="text-sm text-gray-600 mb-2">Button sizes</p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" size="sm" font="display">Small</Button>
            <Button variant="primary" size="md" font="display">Medium</Button>
            <Button variant="primary" size="lg" font="display">Large</Button>
          </div>

          <p className="text-sm text-gray-600 mb-2">Special states: disabled and link</p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" disabled font="display">Disabled</Button>
            <Button variant="primary" href="/" font="display">Link Button</Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm md:text-base text-gray-600 text-blue-800 mb-2">With translations (from t):</p>
            <p className="text-xs text-gray-500 mb-2">Shows how buttons work with i18n</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" font="display">{t.game.playButton}</Button>
              <Button variant="secondary" font="display">{t.navigation.home}</Button>
            </div>
          </div>
        </section>

        {/* TextField Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">TextField</h2>
          
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
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Chip</h2>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Chip>Default</Chip>
            <Chip variant="success">Success</Chip>
            <Chip variant="warning">Warning</Chip>
            <Chip variant="error">Error</Chip>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 text-blue-800 mb-2">Example usage:</p>
            <div className="flex flex-wrap gap-2">
              <Chip variant="success">Online</Chip>
              <Chip variant="warning">In Game</Chip>
              <Chip variant="error">Offline</Chip>
            </div>
          </div>
        </section>

        {/* Design System Section - Tailwind v4 CSS Variable System */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Design System (Tailwind v4 Theme)</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Color Palette */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Color Palette</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Primary (Purple)</p>
                  <div className="flex gap-2">
                    <div className="w-16 h-10 bg-primary rounded" title="bg-primary"></div>
                    <div className="w-16 h-10 bg-primary-hover rounded" title="bg-primary-hover"></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Secondary (Gray)</p>
                  <div className="flex gap-2">
                    <div className="w-16 h-10 bg-secondary rounded" title="bg-secondary"></div>
                    <div className="w-16 h-10 bg-secondary-hover rounded" title="bg-secondary-hover"></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Danger (Red)</p>
                  <div className="flex gap-2">
                    <div className="w-16 h-10 bg-danger rounded" title="bg-danger"></div>
                    <div className="w-16 h-10 bg-danger-hover rounded" title="bg-danger-hover"></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ghost</p>
                  <div className="flex gap-2">
                    <div className="w-16 h-10 border-2 border-dashed border-gray-300 rounded" title="bg-ghost (transparent)"></div>
                    <div className="w-16 h-10 bg-ghost-hover rounded" title="bg-ghost-hover"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chip Colors */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Chip Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-default rounded flex items-center justify-center">
                    <span className="text-xs text-chip-default-text">Default</span>
                  </div>
                  <span className="text-xs text-gray-600">default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-success rounded flex items-center justify-center">
                    <span className="text-xs text-chip-success-text">Success</span>
                  </div>
                  <span className="text-xs text-gray-600">success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-warning rounded flex items-center justify-center">
                    <span className="text-xs text-chip-warning-text">Warning</span>
                  </div>
                  <span className="text-xs text-gray-600">warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-error rounded flex items-center justify-center">
                    <span className="text-xs text-chip-error-text">Error</span>
                  </div>
                  <span className="text-xs text-gray-600">error</span>
                </div>
              </div>
            </div>

            {/* Border & Focus Colors */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Border & Focus</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Focus Ring</p>
                  <div className="w-full h-10 border-2 border-focus rounded"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Border States</p>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 border border-border rounded"></div>
                    <div className="flex-1 h-10 border border-border-hover rounded"></div>
                    <div className="flex-1 h-10 border border-border-error rounded"></div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="flex-1 text-xs text-gray-600 text-center">default</span>
                    <span className="flex-1 text-xs text-gray-600 text-center">hover</span>
                    <span className="flex-1 text-xs text-gray-600 text-center">error</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CSS Variable Reference */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Usage (Tailwind v4)</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">Colors defined in <code className="bg-gray-100 px-1 rounded">globals.css</code> @theme block auto-generate utilities:</p>
                <div className="bg-gray-50 p-2 rounded mt-2 space-y-1">
                  <code className="text-xs text-gray-800 block">--color-primary → bg-primary</code>
                  <code className="text-xs text-gray-800 block">--color-danger → text-danger</code>
                  <code className="text-xs text-gray-800 block">--color-border → border-border</code>
                </div>
                <p className="text-xs text-gray-600 mt-2">Components use CVA (class-variance-authority) for type-safe variants and cn() utility for className merging.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Test Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Responsive (Resize to test)</h2>
          <div className="p-4 bg-white rounded-lg border">
            <p className="text-base md:text-lg text-gray-900 mb-2">
              Body text: text-base md:text-lg
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Heading: text-xl md:text-2xl
            </p>
            <p className="text-sm md:text-base text-gray-600">
              Small: text-sm md:text-base
            </p>
            <p className="mt-4 text-sm md:text-base text-gray-600">
              Resize your browser to see the responsive breakpoints in action.
            </p>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-center text-sm md:text-base text-gray-600">
          <p>This is a development test page. Remove when components are implemented.</p>
        </div>
      </div>
    </div>
  );
}
