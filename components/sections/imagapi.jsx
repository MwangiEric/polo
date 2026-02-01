// src/sections/imagapi.jsx

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, HTMLSelect, Button } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImages from '@meronex/icons/fa/FaImages';

// Only real asset types from your API (no custom/my-images)
const ASSET_TYPES = [
  { value: 'backgrounds',   label: 'Backgrounds',   defaultQuery: 'cartoon' },
  { value: 'icons',         label: 'Icons',         defaultQuery: 'phone' },
  { value: 'textures',      label: 'Textures',      defaultQuery: 'wood' },
  { value: 'mockups',       label: 'Mockups',       defaultQuery: 'iphone' },
  { value: 'patterns',      label: 'Patterns',      defaultQuery: 'geometric' },
  { value: 'gradients',     label: 'Gradients',     defaultQuery: 'blue' },
  { value: 'illustrations', label: 'Illustrations', defaultQuery: 'abstract' },
  { value: 'fonts',         label: 'Fonts',         defaultQuery: 'sans' },
  { value: 'logos',         label: 'Logos',         defaultQuery: 'minimal' },
  { value: 'ui_kits',       label: 'UI Kits',       defaultQuery: 'app' },
  { value: 'stock_photos',  label: 'Stock Photos',  defaultQuery: 'business' },
  { value: 'vector_art',    label: 'Vector Art',    defaultQuery: 'icon' },
];

export const ImagApiPanel = observer(({ store }) => {
  const [assetType, setAssetType] = useState(ASSET_TYPES[0].value);
  const [query, setQuery] = useState(ASSET_TYPES[0].defaultQuery);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedType = ASSET_TYPES.find(t => t.value === assetType);

  const fetchAssets = async (currentQuery) => {
    // Prevent fetch if query is empty or too short
    const safeQuery = (currentQuery || '').trim();
    if (!safeQuery || safeQuery.length < 2) {
      setImages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=\( {assetType}&q= \){encodeURIComponent(safeQuery)}`;

    let fullUrl = targetUrl;
    if (assetType === 'icons') {
      fullUrl += '&style=flat';
    }

    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(fullUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${text || 'No details'}`);
      }

      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response format');
      }

      const formatted = data.images.map(item => ({
        src: item.thumbnail || item.thumbnail_src || item.url,
        url: item.url,
        alt: item.title || `${selectedType?.label} item`,
      }));

      setImages(formatted);
    } catch (err) {
      setError(err.message || 'Failed to load assets');
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only refetch when assetType OR query actually changes
  useEffect(() => {
    fetchAssets(query);
  }, [assetType, query]);

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue); // allow empty – the guard is inside fetchAssets
  };

  const handleClear = () => {
    setQuery(''); // clear input
    // fetchAssets will stop and show empty state
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 10 }}>
      {/* Dropdown – only real API types */}
      <HTMLSelect
        value={assetType}
        onChange={(e) => setAssetType(e.target.value)}
        fill
        large
        style={{ marginBottom: 12 }}
      >
        {ASSET_TYPES.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </HTMLSelect>

      {/* Search bar */}
      <InputGroup
        leftIcon="search"
        placeholder={`Search ${selectedType?.label.toLowerCase()}...`}
        value={query}
        onChange={handleSearchChange}
        rightElement={
          query && <Button minimal icon="cross" onClick={handleClear} small />
        }
        style={{ marginBottom: 15 }}
        large
      />

      {loading && (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          Loading {selectedType?.label.toLowerCase()}...
        </div>
      )}

      {error && (
        <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && query.trim() && (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          No results found for "{query}"
        </div>
      )}

      {!loading && !error && images.length === 0 && !query.trim() && (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#888' }}>
          Type something to search
        </div>
      )}

      <ImagesGrid
        images={images}
        getPreview={img => img.src}
        getSrc={img => img.url}
        rowsNumber={assetType === 'icons' ? 5 : 3}
        isLoading={loading}
        onSelect={img => {
          store.activePage?.addElement({
            type: 'image',
            src: img.url,
            width: assetType === 'icons' ? 140 : 400,
            height: assetType === 'icons' ? 140 : 300,
            keepRatio: true,
          });
        }}
      />
    </div>
  );
});

export const ImagApiSection = {
  name: 'imagapi-assets',
  Tab: props => (
    <SectionTab name="Assets" {...props}>
      <FaImages style={{ marginInline: 'auto' }} />
    </SectionTab>
  ),
  Panel: ImagApiPanel,
};