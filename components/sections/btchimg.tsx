import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, TextArea, FormGroup, InputGroup, ControlGroup, Icon } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import Papa from 'papaparse';

export const BtchImgSection = {
  name: 'batch-image',
  Tab: (props) => (
    <SectionTab name="Batch" {...props}>
      <Icon icon="th-derived" />
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const [csvData, setCsvData] = useState('');
    // State for column mapping (0-indexed)
    const [cols, setCols] = useState({
      name: 2,  // Default for your KenyaTronics list
      price: 6,
      image: 7
    });

    const runBatch = () => {
      // Parse CSV (header: false lets us use raw column numbers)
      const parsed = Papa.parse(csvData, { header: false, skipEmptyLines: true });
      const rows = parsed.data;

      // Start from index 1 if your CSV has a header row
      const startAt = rows[0][0].includes('web_scraper') ? 1 : 0;

      rows.slice(startAt).forEach((row) => {
        const page = store.addPage();

        // Add Image
        if (row[cols.image]) {
          page.addImage({
            src: row[cols.image],
            x: 50, y: 100, width: 300
          });
        }

        // Add Name
        page.addText({
          text: row[cols.name] || 'N/A',
          x: 50, y: 450, width: 300, fontSize: 20,
          fontFamily: 'sans-serif' // Fallback font as requested
        });

        // Add Price
        page.addText({
          text: row[cols.price] || '0.00',
          x: 50, y: 520, fontSize: 30, fill: '#E53935', fontWeight: 'bold'
        });
      });
    };

    return (
      <div style={{ padding: '15px' }}>
        <h4 style={{ marginBottom: '15px' }}>CSV Column Mapping</h4>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <FormGroup label="Name Col" labelFor="name-col">
            <InputGroup 
              id="name-col" 
              type="number" 
              value={cols.name} 
              onChange={(e) => setCols({...cols, name: parseInt(e.target.value)})} 
            />
          </FormGroup>
          <FormGroup label="Price Col" labelFor="price-col">
            <InputGroup 
              id="price-col" 
              type="number" 
              value={cols.price} 
              onChange={(e) => setCols({...cols, price: parseInt(e.target.value)})} 
            />
          </FormGroup>
          <FormGroup label="Photo Col" labelFor="photo-col">
            <InputGroup 
              id="photo-col" 
              type="number" 
              value={cols.image} 
              onChange={(e) => setCols({...cols, image: parseInt(e.target.value)})} 
            />
          </FormGroup>
        </div>

        <FormGroup label="Paste CSV Data">
          <TextArea
            fill={true}
            style={{ minHeight: '200px', fontSize: '11px', fontFamily: 'monospace' }}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste your scraper rows here..."
          />
        </FormGroup>

        <Button 
          intent="primary" 
          large fill 
          onClick={runBatch} 
          disabled={!csvData}
          icon="insert"
        >
          Generate from CSV
        </Button>
      </div>
    );
  }),
};
