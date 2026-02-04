import React, { useEffect } from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';

// SECTIONS (Kept your functional ones)
import { QrSection } from './sections/qr-section';
import { ShapesSection } from './sections/shapes-section';
import { QuotesSection } from './sections/quotes-section';
import { StableDiffusionSection } from './sections/dalle2';
import { ImagApiSection } from './sections/imagapi';
import { BtchImgSection } from './sections/btchimg';
import { BtchVidSection } from './sections/btchvid';
import { JsonPilSection } from './sections/jsonpil';

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";

const store = createStore({
  key: process.env.NEXT_PUBLIC_POLOTNO_API_KEY,
  showCredit: false,
});

// Setup page for Video/Timeline
const page = store.addPage();
page.set({ duration: 5000 }); // Default 5 seconds

const mySections = [
  ...DEFAULT_SECTIONS,
  QrSection,
  ShapesSection,
  QuotesSection,
  StableDiffusionSection,
  ImagApiSection,
  BtchImgSection,
  BtchVidSection,
  JsonPilSection
];

export const Editor = () => {
  useEffect(() => {
    // FORCE FULL DARK UI & TIMELINE LAYOUT
    const style = document.createElement('style');
    style.innerHTML = `
      /* Panels & Sidebar */
      .polotno-panel-container, .polotno-side-panel { background-color: #1a1a1a !important; color: #ececec !important; }
      .polotno-workspace-container { background-color: #0c0c0c !important; }
      .bp4-button { background: #333 !important; color: white !important; border: 1px solid #444 !important; }
      
      /* FORCE V3 TIMELINE */
      .polotno-timeline { 
        background-color: #1a1a1a !important; 
        border-top: 2px solid #333 !important; 
        height: 250px !important; 
        display: flex !important;
      }
      
      /* HIDE PAGE NAVIGATOR (Since we use timeline) */
      .polotno-pages-container, .polotno-page-navigator { display: none !important; }
      
      /* Darken Animation Panel */
      .polotno-animation-panel-container { background: #1a1a1a !important; color: white !important; }
      h3, h4, label { color: #aaa !important; }
    `;
    document.head.appendChild(style);
  }, []);

  // MANUAL MULTI-JSON DOWNLOAD
  const handleDownload = async () => {
    // 1. Standard Polotno JSON (For re-uploading)
    const polotnoBlob = new Blob([JSON.stringify(store.toJSON())], { type: 'application/json' });
    const pUrl = URL.createObjectURL(polotnoBlob);
    const pLink = document.createElement('a');
    pLink.href = pUrl; pLink.download = 'design-backup.json'; pLink.click();

    // 2. Python-Ready PIL JSON
    const pillowData = {
      width: store.width, height: store.height,
      elements: store.pages[0].children.map(el => ({
        id: el.id, type: el.type, x: Math.round(el.x), y: Math.round(el.y),
        text: el.text || '', src: el.src || '', fontSize: el.fontSize || 0
      }))
    };
    const pilBlob = new Blob([JSON.stringify(pillowData)], { type: 'application/json' });
    const pilUrl = URL.createObjectURL(pilBlob);
    const pilLink = document.createElement('a');
    pilLink.href = pilUrl; pilLink.download = 'python-pil-ready.json'; pilLink.click();
  };

  return (
    <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
      <SidePanelWrap>
        <SidePanel store={store} sections={mySections} />
      </SidePanelWrap>

      <WorkspaceWrap>
        <Toolbar 
          store={store} 
          downloadButtonEnabled 
          onDownload={handleDownload} // Triggers both JSON downloads
        />

        <Workspace 
          store={store} 
          mode="video" // Crucial for v3 Timeline
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
};

export default Editor;
