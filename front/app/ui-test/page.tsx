'use client';

import { 
  Button, 
  TextField, 
  Chip, 
  colors, 
  typography, 
  spacing,
  layoutStyles,
  inlineSpacing,
  layout,
  chipColors,
} from '../ui/base';
import { useTranslation } from '../context/language-context';
import { useState } from 'react';

export default function UITestPage() {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState('');
  const [textError, setTextError] = useState('');

  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.contentContainer}>
        <h1 className={`${typography.heading} ${layoutStyles.section}`}>UI Components Test Page</h1>

        {/* Buttons Section */}
        <section className={layoutStyles.section}>
          <h2 className={layoutStyles.sectionHeader}>Buttons</h2>
          
          <div className={`flex flex-wrap ${inlineSpacing.md} mb-6`}>
            <Button variant="primary" font="display">Primary</Button>
            <Button variant="secondary" font="display">Secondary</Button>
            <Button variant="danger" font="display">Danger</Button>
            <Button variant="ghost" font="display">Ghost</Button>
          </div>

          <div className={`flex flex-wrap ${inlineSpacing.md} mb-6`}>
            <Button variant="primary" size="sm" font="display">Small</Button>
            <Button variant="primary" size="md" font="display">Medium</Button>
            <Button variant="primary" size="lg" font="display">Large</Button>
          </div>

          <div className={`flex flex-wrap ${inlineSpacing.md} mb-6`}>
            <Button variant="primary" disabled font="display">Disabled</Button>
            <Button variant="primary" href="/" font="display">Link Button</Button>
          </div>

          <div className={`${layoutStyles.cardHighlight} mb-6`}>
            <p className={`${typography.small} text-blue-800 mb-2`}>With translations (from t):</p>
            <div className={`flex flex-wrap ${inlineSpacing.md}`}>
              <Button variant="primary" font="display">{t.game.playButton}</Button>
              <Button variant="secondary" font="display">{t.navigation.home}</Button>
            </div>
          </div>
        </section>

        {/* TextField Section */}
        <section className={layoutStyles.section}>
          <h2 className={layoutStyles.sectionHeader}>TextField</h2>
          
          <div className={`${layout.maxWidth.md} space-y-6`}>
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
        <section className={layoutStyles.section}>
          <h2 className={layoutStyles.sectionHeader}>Chip</h2>
          
          <div className={`flex flex-wrap ${inlineSpacing.sm} mb-6`}>
            <Chip>Default</Chip>
            <Chip variant="success">Success</Chip>
            <Chip variant="warning">Warning</Chip>
            <Chip variant="error">Error</Chip>
          </div>

          <div className={layoutStyles.cardHighlight}>
            <p className={`${typography.small} text-blue-800 mb-2`}>Example usage:</p>
            <div className={`flex flex-wrap ${inlineSpacing.xs}`}>
              <Chip variant="success">Online</Chip>
              <Chip variant="warning">In Game</Chip>
              <Chip variant="error">Offline</Chip>
            </div>
          </div>
        </section>

        {/* Global Styles Section */}
        <section className={layoutStyles.section}>
          <h2 className={layoutStyles.sectionHeader}>Global Styles (Tailwind)</h2>
          
          <div className={`grid ${inlineSpacing.lg} md:grid-cols-2`}>
            <div className={layoutStyles.card}>
              <h3 className="font-medium mb-2">Colors</h3>
              <div className="space-y-2">
                {Object.entries(colors).map(([name, value]) => (
                  <div key={name} className={`flex items-center ${inlineSpacing.xs}`}>
                    <span className="w-20 text-sm text-gray-600">{name}:</span>
                    <span className={`px-3 py-1 text-sm ${value}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={layoutStyles.card}>
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

            <div className={layoutStyles.card}>
              <h3 className="font-medium mb-2">Spacing</h3>
              <div className={`flex ${inlineSpacing.md}`}>
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
        <section className={layoutStyles.section}>
          <h2 className={layoutStyles.sectionHeader}>Responsive (Resize to test)</h2>
          <div className={layoutStyles.card}>
            <p className={`${typography.body} mb-2`}>
              Body text: text-base md:text-lg
            </p>
            <p className={`${typography.heading} mb-2`}>
              Heading: text-xl md:text-2xl
            </p>
            <p className={`${typography.small}`}>
              Small: text-sm md:text-base
            </p>
            <p className={`mt-4 ${typography.small} text-gray-600`}>
              Resize your browser to see the responsive breakpoints in action.
            </p>
          </div>
        </section>

        <div className={`mt-8 pt-8 border-t text-center ${typography.small} text-gray-600`}>
          <p>This is a development test page. Remove when components are implemented.</p>
        </div>
      </div>
    </div>
  );
}
