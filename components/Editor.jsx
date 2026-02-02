// Editor.jsx

import React from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';
import { Button } from '@blueprintjs/core'; // already have Blueprint

import { QrSection } from './sections/qr-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { QuotesSection } from './sections/quotes-section';
import { StableDiffusionSection } from './sections/dalle2';

// NEW: Import the combined ImagAPI section
import { ImagApiSection } from './sections/imagapi';

// Blueprint styles
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

// Create store
const store = createStore({
  key: process.env.NEXT_PUBLIC_POLOTNO_API_KEY,
  showCredit: false,
});

const page = store.addPage();

// Register custom sections
DEFAULT_SECTIONS.push(QrSection);
DEFAULT_SECTIONS.splice(3, 1, ShapesSection);
DEFAULT_SECTIONS.splice(3, 0, IconsSection);
DEFAULT_SECTIONS.push(QuotesSection);
DEFAULT_SECTIONS.push(StableDiffusionSection);
DEFAULT_SECTIONS.push(ImagApiSection);

// ─────────────────────────────────────────────────────────────
// Export functions
// ─────────────────────────────────────────────────────────────

const exportPolotnoJson = () => {
  const json = store.toJSON();
  const jsonString = JSON.stringify(json, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `polotno-design-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportPillowJson = () => {
  const fullJson = store.toJSON();

  // Simplified structure for Pillow (PIL)
  const pillowJson = {
    width: fullJson.width || 1080,
    height: fullJson.height || 1080,
    background: fullJson.pages?.[0]?.backgroundColor || '#ffffff',
    elements: []
  };

  // Map Polotno elements to Pillow-friendly format
  fullJson.pages?.[0]?.children?.forEach(el => {
    if (el.type === 'image') {
      pillowJson.elements.push({
        type: 'image',
        src: el.src,
        x: Math.round(el.x || 0),
        y: Math.round(el.y || 0),
        width: Math.round(el.width || 0),
        height: Math.round(el.height || 0)
      });
    } else if (el.type === 'text') {
      pillowJson.elements.push({
        type: 'text',
        text: el.text || '',
        x: Math.round(el.x || 0),
        y: Math.round(el.y || 0),
        fontSize: Math.round(el.fontSize || 24),
        color: el.fill || '#000000',
        fontFamily: el.fontFamily || 'Arial',
        align: el.align || 'left'
      });
    }
    // You can extend this later for rect, ellipse, line, etc.
  });

  const jsonString = JSON.stringify(pillowJson, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pillow-ready-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const Editor = () => {
  return (
    <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
      <SidePanelWrap>
        <SidePanel store={store} />
      </SidePanelWrap>

      <WorkspaceWrap>
        <Toolbar store={store} downloadButtonEnabled />

        <Workspace store={store} />
        <ZoomButtons store={store} />

        {/* Floating export buttons */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 10,
          display: 'flex',
          gap: 12
        }}>
          <Button
            intent="primary"
            onClick={exportPolotnoJson}
          >
            Save Polotno JSON
          </Button>

          <Button
            intent="success"
            onClick={exportPillowJson}
          >
            Export for Pillow
          </Button>
        </div>
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

export default Editor;