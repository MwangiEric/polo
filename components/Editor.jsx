import React, { useEffect } from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';
import { Button, Intent } from '@blueprintjs/core';

// SECTIONS
import { QrSection } from './sections/qr-section';
import { ShapesSection } from './sections/shapes-section';
import { QuotesSection } from './sections/quotes-section';
import { StableDiffusionSection } from './sections/dalle2';
import { ImagApiSection } from './sections/imagapi';
import { BtchImgSection } from './sections/btchimg';
import { BtchVidSection } from './sections/btchvid';

// STYLES
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";

const store = createStore({
  key: process.env.NEXT_PUBLIC_POLOTNO_API_KEY,
  showCredit: false,
});

// INITIAL STORE SETUP
const page = store.addPage();
page.set({ duration: 5000 }); // Active timeline from start

const mySections = [
  ...DEFAULT_SECTIONS,
  QrSection,
  ShapesSection,
  QuotesSection,
  StableDiffusionSection,
  ImagApiSection,
  BtchImgSection,
  BtchVidSection
];

export const Editor = () => {
  useEffect(() => {
    // INJECT THE DARK THEME & LAYOUT FIXES
    const style = document.createElement('style');
    style.innerHTML = `
      .polotno-panel-container, .polotno-side-panel { background-color: #1a1a1a !important; color: #ececec !important; }
      .polotno-workspace-container { background-color: #0c0c0c !important; }
      .bp4-button { background: #333 !important; color: white !important; border: 1px solid #444 !important; }
      .bp4-button:hover { background: #444 !important; }
      
      /* FORCE TIMELINE UI */
      .polotno-timeline { 
        background-color: #1a1a1a !important; 
        border-top: 2px solid #333 !important; 
        height: 250px !important; 
        display: flex !important; 
      }
      
      /* HIDE STANDARD PAGE LIST */
      .polotno-pages-container, .polotno-page-navigator { display: none !important; }
      
      /* ANIMATION PANEL DARK MODE */
      .polotno-animation-panel-container { background: #1a1a1a !important; color: white !important; }
      h3, h4, label { color: #aaa !important; }
    `;
    document.head.appendChild(style);
  }, []);

  // JSON EXPORT LOGIC
  const handleJsonExport = async () => {
    // 1. Polotno Original JSON
    const polotnoBlob = new Blob([JSON.stringify(store.toJSON())], { type: 'application/json' });
    const pUrl = URL.createObjectURL(polotnoBlob);
    const pLink = document.createElement('a');
    pLink.href = pUrl; pLink.download = 'design-backup.json'; pLink.click();

    // 2. Python-Ready JSON (For Pillow)
    const pillowData = {
      width: store.width,
      height: store.height,
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
    const pilBlob = new Blob([JSON.stringify(pillowData)], { type: 'application/json' });
    const pilUrl = URL.createObjectURL(pilBlob);
    const pilLink = document.createElement('a');
    pilLink.href = pilUrl; pilLink.download = 'python-pil-ready.json'; pilLink.click();
  };

  // JSON IMPORT LOGIC
  const handleJsonImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (f) => {
        try {
          const json = JSON.parse(f.target.result);
          store.loadJSON(json);
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
            text="Get JSONs" 
            intent={Intent.SUCCESS} 
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
};

export default Editor;
