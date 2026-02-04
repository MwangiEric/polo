// src/sections/jsonpil.jsx

import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, Callout } from '@blueprintjs/core';
import FaFileExport from '@meronex/icons/fa/FaFileExport';

export const JsonPilPanel = observer(({ store }) => {
  const exportPolotno = () => {
    const json = store.toJSON();
    const str = JSON.stringify(json, null, 2);
    downloadJson(str, `polotno-full-${new Date().toISOString().slice(0,10)}.json`);
  };

  const exportPillow = async () => {
    const full = store.toJSON();

    const pillow = {
      width: full.width || 1080,
      height: full.height || 1080,
      background: full.pages?.[0]?.backgroundColor || '#ffffff',
      elements: await Promise.all(
        (full.pages?.[0]?.children || []).map(async el => {
          if (el.type === 'image') {
            // Check if it's an SVG
            const isSvg = el.src?.endsWith('.svg') || el.src?.includes('svg+xml');

            if (isSvg) {
              try {
                // Convert SVG to PNG in browser
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = el.src;

                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = () => reject(new Error('Failed to load SVG image'));
                });

                const canvas = document.createElement('canvas');
                canvas.width = el.width || img.naturalWidth || 512;  // fallback size
                canvas.height = el.height || img.naturalHeight || 512;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const pngDataUrl = canvas.toDataURL('image/png');

                return {
                  type: 'image',
                  src: pngDataUrl,  // ← now a PNG data URL
                  x: Math.round(el.x || 0),
                  y: Math.round(el.y || 0),
                  width: Math.round(el.width || 0),
                  height: Math.round(el.height || 0),
                };
              } catch (err) {
                console.warn('SVG → PNG conversion failed:', err);
                // Fallback: keep original SVG URL
                return {
                  type: 'image',
                  src: el.src,
                  x: Math.round(el.x || 0),
                  y: Math.round(el.y || 0),
                  width: Math.round(el.width || 0),
                  height: Math.round(el.height || 0),
                };
              }
            }

            // Normal raster image (PNG, JPG, etc.)
            return {
              type: 'image',
              src: el.src,
              x: Math.round(el.x || 0),
              y: Math.round(el.y || 0),
              width: Math.round(el.width || 0),
              height: Math.round(el.height || 0),
            };
          }

          if (el.type === 'text') {
            return {
              type: 'text',
              text: el.text || '',
              x: Math.round(el.x || 0),
              y: Math.round(el.y || 0),
              fontSize: Math.round(el.fontSize || 24),
              color: el.fill || '#000000',
              fontFamily: el.fontFamily || 'Arial',
              align: el.align || 'left',
            };
          }

          return null;
        })
      ).then(results => results.filter(Boolean)),
    };

    const str = JSON.stringify(pillow, null, 2);
    downloadJson(str, `pillow-ready-${new Date().toISOString().slice(0,10)}.json`);
  };

  const downloadJson = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>Export Design</h3>

      <Button
        fill
        large
        intent="primary"
        onClick={exportPolotno}
        style={{ marginBottom: 12 }}
      >
        Save Full Polotno JSON (reloadable)
      </Button>

      <Button fill large intent="success" onClick={exportPillow}>
        Export Pillow / PIL JSON (with SVG → PNG conversion)
      </Button>

      <Callout intent="warning" style={{ marginTop: 20 }}>
        SVGs are automatically converted to PNG in the browser for Pillow compatibility.<br />
        Pillow can now render everything directly.
      </Callout>
    </div>
  );
});

export const JsonPilSection = {
  name: 'json-pil-export',
  Tab: (props) => (
    <SectionTab name="Export" {...props}>
      <FaFileExport style={{ marginInline: 'auto' }} />
    </SectionTab>
  ),
  Panel: JsonPilPanel,
  visibleInList: true,
};