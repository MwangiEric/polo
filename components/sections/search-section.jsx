import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button, Card, Spinner } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import { Search } from '@blueprintjs/icons';

export const SearchSection = {
  name: 'product-search',
  Tab: (props) => (
    <SectionTab name="Search" {...props}>
      <Search />
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://far-paule-emw-a67bd497.koyeb.app/search?q=${encodeURIComponent(query)}&categories=images&format=json`
        );
        const data = await response.json();
        // Assuming data.results is the array based on typical SearXNG/JSON formats
        setResults(data.results || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px' }}>
          <InputGroup
            placeholder="Search products (e.g. JBL SRX715)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            rightElement={<Button icon="arrow-right" minimal onClick={handleSearch} />}
          />
        </div>

        <div style={{ overflowY: 'auto', flexGrow: 1, padding: '10px' }}>
          {loading && <Spinner size={30} style={{ marginTop: '20px' }} />}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {results.map((result, index) => (
              <Card
                key={index}
                interactive
                style={{ padding: '5px', background: '#222' }}
                onClick={() => {
                  store.activePage.addImage({
                    src: result.img_src,
                    x: 0,
                    y: 0,
                    width: store.width / 2,
                  });
                }}
              >
                <img
                  src={result.img_src}
                  alt={result.title}
                  style={{ width: '100%', borderRadius: '3px', display: 'block' }}
                  onError={(e) => (e.target.style.display = 'none')} // Hide broken images
                />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }),
};
