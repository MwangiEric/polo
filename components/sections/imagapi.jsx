// src/sections/imagapi.jsx

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, HTMLSelect, Button } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImages from '@meronex/icons/fa/FaImages';

// List of asset types supported by your API
const ASSET_TYPES = [
  { value: 'backgrounds', label: 'Backgrounds', defaultQuery: 'cartoon' },
  { value: 'icons',       label: 'Icons',       defaultQuery: 'phone' },
  { value: 'textures',    label: 'Textures',    defaultQuery: 'wood' },
  { value: 'mockups',     label: 'Mockups',     defaultQuery: 'iphone' },
  // Add more types here when your API supports them
];

// Your own images hosted on ImageKit
const MY_IMAGEKIT_IMAGES = [
  { name: 'Location Pin',     filename: 'location.png' },
  { name: 'Store Icon',       filename: 'store.png' },
  { name: 'Sale Badge',       filename: 'sale-badge.png' },
  { name: 'Discount Tag',     filename: 'discount.png' },
  { name: 'Product Placeholder', filename: 'product-placeholder.jpg' },
  // ← Add as many of your real files as you want
];

export const ImagApiPanel = observer(({ store }) => {
  const [assetType, setAssetType] = useState(ASSET_TYPES[0].value);
  const [query, setQuery] = useState(ASSET_TYPES[0].defaultQuery);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedType = ASSET_TYPES.find(t => t.value === assetType);
  const isMyImages = assetType === 'my-images';

  const fetchAssets = async () => {
    if (isMyImages) {
      // Show your own ImageKit images
      const formatted = MY_IMAGEKIT_IMAGES.map(img => ({
        src: `https://ik.imagekit.io/ericmwangi/${img.filename}?tr=w-200,h-200`,
        url: `https://ik.imagekit.io/ericmwangi/${img.filename}`,
        alt: img.name,
      }));
      setImages(formatted);
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent invalid/empty queries that cause 422
    let safeQuery = (query || '').trim();
    if (!safeQuery || safeQuery.length < 2) {
      safeQuery = selectedType?.defaultQuery || 'default';
      setQuery(safeQuery); // update the input to show fallback
    }

    setLoading(true);
    setError(null);

    const targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=\( {assetType}&q= \){encodeURIComponent(safeQuery)}`;

    // Optional extra params
    let fullUrl = targetUrl;
    if (assetType === 'icons') {
      fullUrl += '&style=flat';
    }

    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(fullUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${errorText || 'No details'}`);
      }

      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response: no images array');
      }

      const formatted = data.images.map(item => ({
        src: item.thumbnail || item.thumbnail_src || item.url,
        url: item.url,
        alt: item.title || `${selectedType?.label} item`,
      }));

      setImages(formatted);

      // Optional: log total found for debugging
      if (data.total_found) {
        console.log(`Found ${data.total_found} total items`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assets');
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [assetType, query]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setAssetType(newType);
    // Reset query to default for the selected type
    const defaultQ = ASSET_TYPES.find(t => t.value === newType)?.defaultQuery || '';
    setQuery(defaultQ);
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery(selectedType?.defaultQuery || '');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 10 }}>
      {/* Dropdown to switch asset type */}
      <HTMLSelect
        value={assetType}
        onChange={handleTypeChange}
        fill
        large
        style={{ marginBottom: 12 }}
      >
        {ASSET_TYPES.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
        <option value="my-images">My ImageKit Images</option>
      </HTMLSelect>

      {/* Search bar (hidden when viewing your own images) */}
      {!isMyImages && (
        <InputGroup
          leftIcon="search"
          placeholder={`Search ${selectedType?.label.toLowerCase()}...`}
          value={query}
          onChange={handleSearchChange}
          rightElement={
            query && <Button minimal icon="cross" onClick={clearSearch} />
          }
          style={{ marginBottom: 15 }}
          large
        />
      )}

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

      {!loading && !error && images.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          No items found{!isMyImages ? ` for "${query}"` : ''}.
        </div>
      )}

      <ImagesGrid
        images={images}
        getPreview={img => img.src}
        getSrc={img => img.url}
        rowsNumber={assetType === 'icons' || assetType === 'my-images' ? 5 : 3}
        isLoading={loading}
        onSelect={img => {
          store.activePage?.addElement({
            type: 'image',
            src: img.url,
            width: assetType === 'icons' || assetType === 'my-images' ? 140 : 400,
            height: assetType === 'icons' || assetType === 'my-images' ? 140 : 300,
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