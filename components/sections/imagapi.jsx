// src/sections/imagapi.jsx

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, HTMLSelect } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImages from '@meronex/icons/fa/FaImages';

// List of asset types from your ImagAPI
const ASSET_TYPES = [
  { value: 'backgrounds', label: 'Backgrounds', defaultQuery: 'cartoon' },
  { value: 'icons', label: 'Icons', defaultQuery: 'phone' },
  { value: 'textures', label: 'Textures', defaultQuery: 'wood' },
  { value: 'mockups', label: 'Mockups', defaultQuery: 'iphone' },
  // Add more types here when needed
];

// Your personal ImageKit images (add as many as you want)
const MY_IMAGEKIT_IMAGES = [
  { name: 'Location Pin', filename: 'location.png' },
  { name: 'Store Icon', filename: 'store-icon.png' }, // example
  { name: 'Sale Badge', filename: 'sale-badge.png' }, // example
  { name: 'Discount Tag', filename: 'discount.png' }, // example
  { name: 'Product Placeholder', filename: 'product-placeholder.jpg' }, // example
  // Keep adding your real filenames here
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
      // Load your own ImageKit images
      const formatted = MY_IMAGEKIT_IMAGES.map(img => ({
        src: `https://ik.imagekit.io/ericmwangi/${img.filename}?tr=w-200,h-200`, // thumbnail/preview
        url: `https://ik.imagekit.io/ericmwangi/${img.filename}`,
        alt: img.name,
      }));
      setImages(formatted);
      setLoading(false);
      setError(null);
      return;
    }

    // Fetch from ImagAPI
    setLoading(true);
    setError(null);

    let targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=\( {assetType}&q= \){encodeURIComponent(query)}`;

    // Optional extra params for certain types
    if (assetType === 'icons') {
      targetUrl += '&style=flat';
    }

    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(targetUrl)}`;

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const formatted = (data.images || []).map(item => ({
        src: item.thumbnail || item.thumbnail_src || item.url,
        url: item.url,
        alt: item.title || `${selectedType?.label} item`,
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
    fetchAssets();
  }, [assetType, query]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setAssetType(newType);
    // Reset query to default for this type
    const defaultQ = ASSET_TYPES.find(t => t.value === newType)?.defaultQuery || '';
    setQuery(defaultQ);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 10 }}>
      {/* Dropdown to switch between asset types */}
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

      {/* Search only shown for API types */}
      {!isMyImages && (
        <InputGroup
          leftIcon="search"
          placeholder={`Search ${selectedType?.label.toLowerCase()}...`}
          value={query}
          onChange={e => setQuery(e.target.value.trim())}
          style={{ marginBottom: 15 }}
        />
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {!loading && !error && images.length === 0 && (
        <div>No items found{!isMyImages ? ` for "${query}"` : ''}</div>
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