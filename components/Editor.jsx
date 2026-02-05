// Editor.jsx

import React, { useEffect } from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';
import { Button } from '@blueprintjs/core';

// ─────────────────────────────────────────────
// Your custom sections
// ─────────────────────────────────────────────
import { QrSection } from './sections/qr-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { QuotesSection } from './sections/quotes-section';
import { StableDiffusionSection } from './sections/dalle2';
import { ImagApiSection } from './sections/imagapi';

// New export & batch sections
import { JsonPilSection } from './sections/jsonpil';
import { BtchImgSection } from './sections/btchimg';
import { BtchVidSection } from './sections/btchvid';

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

// ─────────────────────────────────────────────
// Store setup
// ─────────────────────────────────────────────
const store = createStore({
  key: process.env.NEXT_PUBLIC_POLOTNO_API_KEY,
  showCredit: false,
});

store.addPage();
//sssss.enableTimeline(true); // Enable timeline & video support

// ─────────────────────────────────────────────
// Sections — all defaults + your customs
// ─────────────────────────────────────────────
const mySections = [
  ...DEFAULT_SECTIONS,  // keeps every built-in Polotno tab

  // Your custom sections
  ImagApiSection,
  QrSection,
  ShapesSection,
  IconsSection,
  QuotesSection,
  StableDiffusionSection,

  // New tabs
  JsonPilSection,
  BtchImgSection,
  BtchVidSection,
];

export default function Editor() {
  // Dark theme injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .polotno-panel-container, .polotno-side-panel {
        background-color: #1a1a1a !important;
        color: #ececec !important;
      }
      .polotno-workspace-container {
        background-color: #0c0c0c !important;
      }
      .bp4-button {
        background: #333 !important;
        color: white !important;
        border: 1px solid #444 !important;
      }
      .bp4-button:hover {
        background: #444 !important;
      }
      .polotno-timeline {
        background-color: #1a1a1a !important;
        border-top: 2px solid #333 !important;
        height: 250px !important;
        display: flex !important;
      }
      .polotno-pages-container, .polotno-page-navigator {
        display: none !important;
      }
      .polotno-animation-panel-container {
        background: #1a1a1a !important;
        color: white !important;
      }
      h3, h4, label {
        color: #aaa !important;
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  // ─────────────────────────────────────────────
  // JSON Export / Import
  // ─────────────────────────────────────────────

  const handleJsonExport = () => {
    // Polotno full JSON
    const polotnoJson = store.toJSON();
    const polotnoStr = JSON.stringify(polotnoJson, null, 2);
    const polotnoBlob = new Blob([polotnoStr], { type: 'application/json' });
    const pUrl = URL.createObjectURL(polotnoBlob);
    const pLink = document.createElement('a');
    pLink.href = pUrl;
    pLink.download = 'design-backup.json';
    pLink.click();
    URL.revokeObjectURL(pUrl);

    // Pillow-ready JSON
    const pillowData = {
      width: store.width,
      height: store.height,
      background: store.pages[0]?.backgroundColor || '#ffffff',
      elements: store.pages[0].children.map(el => ({
        id: el.id,
        type: el.type,
        x: Math.round(el.x),
        y: Math.round(el.y),
        width: Math.round(el.width),
        height: Math.round(el.height),
        text: el.text || '',
        src: el.src || '',
        fontSize: el.fontSize || 0,
        fill: el.fill || '#000000',
        fontFamily: el.fontFamily || 'Arial'
      }))
    };
    const pilStr = JSON.stringify(pillowData, null, 2);
    const pilBlob = new Blob([pilStr], { type: 'application/json' });
    const pilUrl = URL.createObjectURL(pilBlob);
    const pilLink = document.createElement('a');
    pilLink.href = pilUrl;
    pilLink.download = 'python-pil-ready.json';
    pilLink.click();
    URL.revokeObjectURL(pilUrl);
  };

  const handleJsonImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target.result);
          store.loadJSON(json);
          console.log('JSON loaded');
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
      <SidePanelWrap>
        <SidePanel store={store} sections={mySections} />
      </SidePanelWrap>

      <WorkspaceWrap>
        <Toolbar store={store} downloadButtonEnabled>
          <Toolbar.Divider />
          <Button
            icon="import"
            text="Load JSON"
            minimal
            onClick={handleJsonImport}
          />
          <Button
            icon="code"
            text="Export JSONs"
            intent="success"
            minimal
            onClick={handleJsonExport}
          />
        </Toolbar>

        <Workspace
          store={store}
          mode="video"
          pageManagementEnabled={false}
          components={{
            Timeline: true,
            Animate: true
          }}
        />

        <ZoomButtons store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
}
