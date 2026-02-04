import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, TextArea, FormGroup, InputGroup, Icon } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';

export const BtchImgSection = {
  name: 'batch-image',
  Tab: (props) => (
    <SectionTab name="Batch" {...props}>
      <Icon icon="th-derived" />
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const [csvData, setCsvData] = useState('');
    const [cols, setCols] = useState({ name: 2, price: 6, image: 7 });

    // Built-in parser that handles commas inside quotes
    const parseCSV = (str) => {
      const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      return str.split('\n').filter(line => line.trim()).map(line => {
        return line.split(regex).map(val => val.replace(/^"|"$/g, '').trim());
      });
    };

    const runBatch = () => {
      if (!csvData) return;
      const rows = parseCSV(csvData);
      
      // Check if first row is a header and skip it
      const startIdx = rows[0][0].includes('web_scraper') ? 1 : 0;

      rows.slice(startIdx).forEach((row) => {
        const page = store.addPage();

        // Add Image (Photo Col)
        if (row[cols.image]) {
          page.addImage({
            src: row[cols.image],
            x: 50, y: 80, width: 300
          });
        }

        // Add Name (Name Col)
        page.addText({
          text: row[cols.name] || 'Product Name',
          x: 50, y: 420, width: 350, fontSize: 22, fontWeight: 'bold',
          fontFamily: 'sans-serif' // Your fallback font
        });

        // Add Price (Price Col)
        page.addText({
          text: row[cols.price] || 'Ksh 0.00',
          x: 50, y: 500, fontSize: 32, fill: '#E53935', fontWeight: 'bold',
          fontFamily: 'sans-serif'
        });
      });
    };

    return (
      <div style={{ padding: '15px' }}>
        <h3 style={{ marginTop: 0 }}>Bulk CSV Importer</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <FormGroup label="Name Col #">
            <InputGroup 
              type="number" 
              value={cols.name} 
              onChange={(e) => setCols({...cols, name: parseInt(e.target.value) || 0})} 
            />
          </FormGroup>
          <FormGroup label="Price Col #">
            <InputGroup 
              type="number" 
              value={cols.price} 
              onChange={(e) => setCols({...cols, price: parseInt(e.target.value) || 0})} 
            />
          </FormGroup>
          <FormGroup label="Photo Col #">
            <InputGroup 
              type="number" 
              value={cols.image} 
              onChange={(e) => setCols({...cols, image: parseInt(e.target.value) || 0})} 
            />
          </FormGroup>
        </div>

        <FormGroup label="Paste Scraper Data:">
          <TextArea
            fill={true}
            style={{ minHeight: '250px', fontFamily: 'monospace', fontSize: '11px' }}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder='Paste rows here...'
          />
        </FormGroup>

        <Button 
          intent="primary" 
          large fill 
          onClick={runBatch} 
          icon="insert"
        >
          Generate {csvData ? parseCSV(csvData).length - 1 : 0} Posters
        </Button>
      </div>
    );
  }),
};
