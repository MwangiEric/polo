import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { TextArea, Button, Callout } from '@blueprintjs/core';

export const BtchVidPanel = observer(({ store }) => {
  const [list, setList] = useState('');
  const [status, setStatus] = useState('');

  const generateVideos = async () => {
    const currentDesign = store.toJSON();
    const lines = list.trim().split('\n');

    for (const [i, line] of lines.entries()) {
      const parts = line.split('@');
      if (parts.length < 2) continue;
      const p = { name: parts[0].trim(), price: parts[1].trim() };

      store.loadJSON(currentDesign);
      await new Promise(r => setTimeout(r, 1200));

      store.pages.forEach(page => {
        page.children.forEach(el => {
          if (el.name === 'product_name') el.set({ text: p.name });
          if (el.name === 'product_price') el.set({ text: `KSh ${p.price}` });
        });
      });

      await new Promise(r => setTimeout(r, 1000));
      const blob = await store.toVideoBlob({ duration: 5, fps: 30 });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${p.name.replace(/\s+/g, '-')}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Video ${i + 1}/${lines.length} ready`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Batch Video</h3>
      <TextArea fill value={list} onChange={e => setList(e.target.value)} style={{ minHeight: 150, marginBottom: 10 }} />
      <Button intent="primary" fill onClick={generateVideos}>Generate Videos</Button>
      {status && <Callout style={{ marginTop: 10 }}>{status}</Callout>}
    </div>
  );
});

export const BtchVidSection = {
  name: 'batch-vid',
  Tab: props => <SectionTab name="Video" {...props}><FaVideo style={{ marginInline: 'auto' }} /></SectionTab>,
  Panel: BtchVidPanel,
};
