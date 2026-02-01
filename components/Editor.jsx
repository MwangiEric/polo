// Editor.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';

import { QrSection } from './sections/qr-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { QuotesSection } from './sections/quotes-section';
import { StableDiffusionSection } from './sections/dalle2';

// NEW: Import the combined ImagAPI section (single file with dropdown)
import { ImagApiSection } from './sections/imagapi';

// Blueprint styles (already present)
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";

// Create Polotno store
const store = createStore({
  key: process.env.NEXT_PUBLIC_POLOTNO_API_KEY,
  showCredit: false,
});

// Optional: add a default page and example element
const page = store.addPage();
// page.addElement({
//   type: 'video',
//   x: 200,
//   y: 200,
//   width: 500,
//   height: 500,
//   src: 'https://vs.contentportal.link/assets/8b413ea8-7d60-4ebb-bf96-d22f8bf4c87f'
// });

// Add/reorder your custom sections
DEFAULT_SECTIONS.push(QrSection);
DEFAULT_SECTIONS.splice(3, 1, ShapesSection);
DEFAULT_SECTIONS.splice(3, 0, IconsSection);
DEFAULT_SECTIONS.push(QuotesSection);
DEFAULT_SECTIONS.push(StableDiffusionSection);

// Add the new ImagAPI section (with dropdown for all asset types + your ImageKit images)
DEFAULT_SECTIONS.push(ImagApiSection);

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
      </WorkspaceWrap>
    </PolotnoContainer>
  );
};

export default Editor;

// Optional export function (uncomment if needed)
// export const exportDataURL = async () => {
//   return await store.toDataURL();
// };