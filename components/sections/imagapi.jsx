import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, HTMLSelect, Button } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';

const ASSET_TYPES = [
  { value: 'backgrounds',   label: 'Backgrounds',   defaultQuery: 'cartoon' },
  { value: 'icons',         label: 'Icons',         defaultQuery: 'phone' },
  { value: 'textures',      label: 'Textures',      defaultQuery: 'wood' },
  { value: 'patterns',      label: 'Patterns',      defaultQuery: 'geometric' },
  { value: 'gradients',     label: 'Gradients',     defaultQuery: 'blue' },
  { value: 'illustrations', label: 'Illustrations', defaultQuery: 'abstract' },
  { value: 'mockups',       label: 'Mockups',       defaultQuery: 'iphone' },
  { value: 'stock_photos',  label: 'Stock Photos',  defaultQuery: 'business' },
];

export const ImagApiPanel = observer(({ store }) => {
  const [assetType, setAssetType] = useState(ASSET_TYPES[0].value);
  const [query, setQuery] = useState(ASSET_TYPES[0].defaultQuery);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    const safeQuery = query.trim();
    if (safeQuery.length < 2) return;

    setLoading(true);
    const targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=${assetType}&q=${encodeURIComponent(safeQuery)}&n=30`;
    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      const data = await response.json();
      setImages(data.images.map(item => ({
        thumbnail: item.thumbnail || item.url,
        fullUrl: item.url,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAssets, 500);
    return () => clearTimeout(timer);
  }, [assetType, query]);

  const addFullImage = (item) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = item.fullUrl;
    img.onload = () => {
      const ratio = img.height / img.width;
      const width = assetType === 'icons' ? 200 : 600;
      store.activePage?.addElement({
        type: 'image',
        src: item.fullUrl,
        width,
        height: width * ratio,
        keepRatio: true,
      });
    };
  };

  return (
    <div style={{ padding: 10 }}>
      <HTMLSelect fill value={assetType} onChange={(e) => setAssetType(e.target.value)} style={{ marginBottom: 10 }}>
        {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </HTMLSelect>
      <InputGroup leftIcon="search" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
      <ImagesGrid images={images} getPreview={img => img.thumbnail} isLoading={loading} onSelect={addFullImage} />
    </div>
  );
});

export const ImagApiSection = {
  name: 'imagapi',
  Tab: props => <SectionTab name="Assets" {...props}><FaImages style={{ marginInline: 'auto' }} /></SectionTab>,
  Panel: ImagApiPanel,
};
