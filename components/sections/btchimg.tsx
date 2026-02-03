import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { TextArea, Button, Callout } from '@blueprintjs/core';
import FaImages from '@meronex/icons/fa/FaImages';

export const BtchImgPanel = observer(({ store }) => {
  const [list, setList] = useState('');
  const [status, setStatus] = useState('');

  const generateBatch = async () => {
    const currentDesign = store.toJSON();
    const lines = list.trim().split('\n');
    
    for (const [i, line] of lines.entries()) {
      const parts = line.split('@');
      if (parts.length < 2) continue;
      const p = { name: parts[0].trim(), price: parts[1].trim() };

      store.loadJSON(currentDesign);
      await new Promise(r => setTimeout(r, 800)); // Wait for fonts/images

      store.pages.forEach(page => {
        page.children.forEach(el => {
          if (el.name === 'product_name') el.set({ text: p.name });
          if (el.name === 'product_price') el.set({ text: `KSh ${p.price}` });
        });
      });

      await new Promise(r => setTimeout(r, 400));
      const dataUrl = await store.toDataURL({ pixelRatio: 3 }); // HIGH QUALITY
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${p.name.replace(/\s+/g, '-')}.png`;
      a.click();
      setStatus(`Exported ${i + 1}/${lines.length}`);
    }
    setStatus('Batch Complete');
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Batch Image Export</h3>
      <p style={{ fontSize: '0.8em' }}>Rename layers to <b>product_name</b> and <b>product_price</b>.</p>
      <TextArea fill value={list} onChange={e => setList(e.target.value)} style={{ minHeight: 150, marginBottom: 10 }} placeholder="Product @Price" />
      <Button intent="success" fill onClick={generateBatch}>Start Batch</Button>
      {status && <Callout style={{ marginTop: 10 }}>{status}</Callout>}
    </div>
  );
});

export const BtchImgSection = {
  name: 'batch-img',
  Tab: props => <SectionTab name="Batch" {...props}><FaImages style={{ marginInline: 'auto' }} /></SectionTab>,
  Panel: BtchImgPanel,
};
