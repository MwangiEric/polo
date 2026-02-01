// src/sections/my-backgrounds-section.jsx
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImage from '@meronex/icons/fa/FaImage';

export const MyBackgroundsPanel = observer(({ store }) => {
  const [query, setQuery] = useState('cartoon'); // default search term
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = async (searchQuery) => {
    setLoading(true);
    setError(null);

    const targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=backgrounds&q=${encodeURIComponent(searchQuery)}`;

    // Using your working CORS proxy
    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response: no images array found');
      }

      // Format images for Polotno ImagesGrid
      const formatted = data.images.map((item) => ({
        src: item.thumbnail || item.thumbnail_src || item.url, // preview image
        url: item.url,                                         // full resolution image
        alt: item.title || `Background - ${searchQuery}`,
      }));

      setImages(formatted);
    } catch (err) {
      setError(err.message || 'Failed to load backgrounds');
      console.error('Background fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when query changes
  useEffect(() => {
    fetchImages(query);
  }, [query]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setQuery(value || 'cartoon'); // never allow empty query
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 10 }}>
      <InputGroup
        leftIcon="search"
        placeholder="Search backgrounds (cartoon, nature, abstract...)"
        value={query}
        onChange={handleSearch}
        style={{ marginBottom: 15 }}
        large
      />

      {loading && <div style={{ padding: '20px 0', textAlign: 'center' }}>Loading backgrounds...</div>}

      {error && (
        <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          No backgrounds found for &quot;{query}&quot;. Try another search term.
        </div>
      )}

      <ImagesGrid
        images={images}
        getPreview={(img) => img.src}
        getSrc={(img) => img.url}
        getAlt={(img) => img.alt}
        rowsNumber={3}
        isLoading={loading}
        loadMore={false} // add pagination later if needed
        onSelect={(img) => {
          // Most common use-case for backgrounds: set as page background
          store.activePage?.set({
            backgroundImage: img.url,
            backgroundScaleMode: 'cover', // options: 'cover', 'contain', 'repeat'
          });

          // Alternative: add as regular draggable image
          /*
          store.activePage?.addElement({
            type: 'image',
            src: img.url,
            width: 800,
            height: 600,
            x: 100,
            y: 100,
          });
          */
        }}
      />
    </div>
  );
});

// Section definition (tab + panel)
export const MyBackgroundsSection = {
  name: 'my-backgrounds',
  Tab: (props) => (
    <SectionTab name="Backgrounds" {...props}>
      <FaImage style={{ marginInline: 'auto' }} />
    </SectionTab>
  ),
  Panel: MyBackgroundsPanel,
};