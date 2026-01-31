// src/sections/my-backgrounds-section.jsx
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup } from '@blueprintjs/core'; // already in your project (from blueprint.css import)
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import FaImage from '@meronex/icons/fa/FaImage'; // or any icon you like (you have @meronex/icons)

export const MyBackgroundsPanel = observer(({ store }) => {
  const [query, setQuery] = useState('cartoon'); // initial/default search
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = async (searchQuery) => {
    setLoading(true);
    setError(null);

    const targetUrl = `https://imagapi.vercel.app/api/v1/assets/search?asset_type=backgrounds&q=${encodeURIComponent(searchQuery)}`;

    // Use your CORS proxy (since it works now)
    const proxyUrl = `https://cors.ericmwangi13.workers.dev/?url=${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid images data');
      }

      // Format for Polotno ImagesGrid
      const formatted = data.images.map((item) => ({
        src: item.thumbnail || item.thumbnail_src || item.url, // preview (fallback to full if no thumb)
        url: item.url,                                         // full image for canvas
        alt: item.title || `Background for ${searchQuery}`,
      }));

      setImages(formatted);
    } catch (err) {
      setError(err.message || 'Failed to load backgrounds');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(query);
  }, [query]); // auto-refetch when query changes

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setQuery(value || 'cartoon'); // fallback to default if empty
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 10 }}>
      <InputGroup
        leftIcon="search"
        placeholder="Search backgrounds (e.g., cartoon, nature...)"
        value={query}
        onChange={handleSearch}
        style={{ marginBottom: 15 }}
        large
      />

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {!loading && !error && images.length === 0 && (
        <div>No results for "{query}". Try another term.</div>
      )}

      <ImagesGrid
        images={images}
        getPreview={(img) => img.src}
        getSrc={(img) => img.url}
        getAlt={(img) => img.alt}
        rowsNumber={3}
        isLoading={loading}
        loadMore={false} // can add later if API supports pagination
        onSelect={(img) => {
          // Set as page background (common for backgrounds)
          store.activePage?.set({
            backgroundImage: img.url,
            backgroundScaleMode: 'cover', // or 'contain', 'repeat'
          });
          // Alternative: add as draggable image element
          // store.activePage?.addElement({
          //   type: 'image',
          //   src: img.url,
          //   width: 800,
          //   height: 600,
          //   x: 100,
          //   y: 100,
          // });
        }}
      />
    </div>
  );
});

// Define the section (like your ShapesSection)
export const MyBackgroundsSection = {
  name: 'my-backgrounds',
  Tab: (props) => (
    <SectionTab name="Backgrounds" {...props}>
      <FaImage style={{ marginInline: 'auto' }} />
    </SectionTab>
  ),
  Panel: MyBackgroundsPanel,
};