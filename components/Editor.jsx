import React from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS, LayersSection } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';

// Your custom sections
import { ImagApiSection } from './sections/imagapi';
import { BtchImgSection } from './sections/btchimg';
import { BtchVidSection } from './sections/btchvid';
import { JsonPilSection } from './sections/jsonpil';

// Styles
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";

const store = createStore({
  key: process.env.NEXT_PUBLIC_POLOTNO_API_KEY,
  showCredit: false,
});

store.addPage();

// Construct the sidebar sections
const mySections = [
  ...DEFAULT_SECTIONS,
  LayersSection,    // REQUIRED to rename layers for the batch to work
  ImagApiSection,
  BtchImgSection,
  BtchVidSection,
  JsonPilSection,
];

export const Editor = () => {
  return (
    <PolotnoContainer style={{ width: "100vw", height: "100vh" }}>
      <SidePanelWrap>
        <SidePanel store={store} sections={mySections} />
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
