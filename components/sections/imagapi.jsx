import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, HTMLSelect, Button } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImages from '@meronex/icons/fa/FaImages';

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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedType = ASSET_TYPES.find(t => t.value === assetType);

  const fetchAssets = async () => {
    const safeQuery = (query || '').trim();
    if (!safeQuery || safeQuery.length < 2) {
      setImages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Kept your requested URL structure
    const targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=${assetType}&q=${encodeURIComponent(safeQuery)}&n=30`;

    let fullUrl = targetUrl;
    if (assetType === 'icons') {
      fullUrl += '&style=flat';
    }

    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(fullUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${text}`);
      }

      const data = await response.json();
      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response - no images array');
      }

      const formatted = data.images.map(item => ({
        thumbnail: item.thumbnail || item.thumbnail_src || item.url,
        fullUrl: item.url,
        alt: item.title || `${selectedType?.label || 'Asset'} item`,
      }));

      setImages(formatted);
    } catch (err) {
      setError(err.message || 'Failed to load assets');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAssets, 500);
    return () => clearTimeout(timer);
  }, [assetType, query]);

  const handleSearchChange = (e) => setQuery(e.target.value);
  const handleClear = () => setQuery('');

  // FIX: Aspect-ratio aware adding to prevent cropping
  const addFullImage = (item) => {
    const fullSrc = item.fullUrl || item.url;
    const initialWidth = assetType === 'icons' ? 180 : 600;

    // Use HTML Image to find true dimensions before adding to canvas
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = fullSrc;

    img.onload = () => {
      const ratio = img.height / img.width;
      store.activePage?.addElement({
        type: 'image',
        src: fullSrc,
        x: (store.width / 2) - (initialWidth / 2),
        y: (store.height / 2) - ((initialWidth * ratio) / 2),
        width: initialWidth,
        height: initialWidth * ratio, // Explicitly set height based on natural ratio
        keepRatio: true,
      });
    };

    // Fallback if image fails to load or takes too long
    img.onerror = () => {
      store.activePage?.addElement({
        type: 'image',
        src: fullSrc,
        width: initialWidth,
        keepRatio: true,
      });
    };
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
        placeholder={`Search ${selectedType?.label.toLowerCase()}...`}
        value={query}
        onChange={handleSearchChange}
        rightElement={query && <Button minimal icon="cross" onClick={handleClear} small />}
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
          No results for "{query}"
        </div>
      )}

      <ImagesGrid
        images={images}
        getPreview={img => img.thumbnail}
        rowsNumber={assetType === 'icons' ? 5 : 3}
        isLoading={loading}
        onSelect={addFullImage}
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
  visibleInList: true,
};
