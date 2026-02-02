// src/sections/imagapi.jsx

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, HTMLSelect, Button } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImages from '@meronex/icons/fa/FaImages';

// Valid asset types from your API docs
const ASSET_TYPES = [
  { value: 'backgrounds',   label: 'Backgrounds',   defaultQuery: 'cartoon' },
  { value: 'icons',         label: 'Icons',         defaultQuery: 'phone' },
  { value: 'textures',      label: 'Textures',      defaultQuery: 'wood' },
  { value: 'patterns',      label: 'Patterns',      defaultQuery: 'geometric' },
  { value: 'gradients',     label: 'Gradients',     defaultQuery: 'blue' },
  { value: 'illustrations', label: 'Illustrations', defaultQuery: 'abstract' },
  { value: 'mockups',       label: 'Mockups',       defaultQuery: 'iphone' },
  { value: 'fonts',         label: 'Fonts',         defaultQuery: 'sans' },
  { value: 'logos',         label: 'Logos',         defaultQuery: 'minimal' },
  { value: 'ui_kits',       label: 'UI Kits',       defaultQuery: 'app' },
  { value: 'stock_photos',  label: 'Stock Photos',  defaultQuery: 'business' },
  { value: 'vector_art',    label: 'Vector Art',    defaultQuery: 'icon' },
];

export const ImagApiPanel = observer(({ store }) => {
  const [assetType, setAssetType] = useState(ASSET_TYPES[0].value);
  const [query, setQuery] = useState(ASSET_TYPES[0].defaultQuery);
  const [images, setImages] = useState([]);           // thumbnails + metadata
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedType = ASSET_TYPES.find(t => t.value === assetType);

  const fetchThumbnails = async () => {
    const safeQuery = (query || '').trim();

    // Skip if query too short or empty
    if (!safeQuery || safeQuery.length < 2) {
      setImages([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Safety: only valid asset types
    if (!ASSET_TYPES.some(t => t.value === assetType)) {
      setError('Invalid asset type selected. Please choose again.');
      setImages([]);
      setLoading(false);
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

    console.log('Fetching thumbnails:', proxyUrl);

    try {
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        let errorText = '';
        try {
          const json = await response.json();
          errorText = json.detail?.[0]?.msg || JSON.stringify(json.detail) || '';
        } catch {
          errorText = await response.text().catch(() => '');
        }
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response – no images array');
      }

      // Store thumbnails + full URL metadata
      const formatted = data.images.map(item => ({
        thumbnail: item.thumbnail || item.thumbnail_src || item.url,
        fullUrl: item.url,
        alt: item.title || `${selectedType?.label || 'Asset'} item`,
      }));

      setImages(formatted);
    } catch (err) {
      setError(err.message || 'Failed to load thumbnails');
      console.error('Thumbnail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch (wait 500ms after user stops typing)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchThumbnails();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [assetType, query]);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
  };

  const addFullImage = (item) => {
    store.activePage?.addElement({
      type: 'image',
      src: item.fullUrl,   // ← only now load full image
      width: assetType === 'icons' ? 140 : 400,
      height: assetType === 'icons' ? 140 : 300,
      keepRatio: true,
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 10 }}>
      <HTMLSelect
        value={assetType}
        onChange={(e) => {
          setAssetType(e.target.value);
          const defaultQ = ASSET_TYPES.find(t => t.value === e.target.value)?.defaultQuery || '';
          setQuery(defaultQ);
        }}
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

      <InputGroup
        leftIcon="search"
        placeholder={`Search ${selectedType?.label.toLowerCase() || 'assets'}...`}
        value={query}
        onChange={handleSearchChange}
        rightElement={
          query && <Button minimal icon="cross" onClick={handleClear} small />
        }
        style={{ marginBottom: 15 }}
        large
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#666' }}>
          Loading thumbnails...
        </div>
      )}

      {error && (
        <div style={{ color: 'red', textAlign: 'center', padding: '15px', background: '#ffebee', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && query.trim() && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#666' }}>
          No results for <strong>"{query}"</strong>
        </div>
      )}

      {!loading && !error && images.length === 0 && !query.trim() && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
          Type at least 2 characters to search
        </div>
      )}

      <ImagesGrid
        images={images}
        getPreview={img => img.thumbnail}   // ← thumbnail only in grid
        getSrc={img => img.thumbnail}       // not used for full load
        rowsNumber={assetType === 'icons' ? 5 : 3}
        isLoading={loading}
        onSelect={img => {
          addFullImage(img);  // ← load full image only on click
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