// PlaylistManager - Enhanced Manager Component
import React, { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface PlaylistManagerProps {
  className?: string;
  onItemSelect?: (item: Item) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  className = '',
  onItemSelect
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockItems: Item[] = [
          {
            id: '1',
            name: 'Sample Item 1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setItems(mockItems);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    onItemSelect?.(item);
  };

  if (loading) {
    return <div className={`manager-loading ${className}`}>Loading...</div>;
  }

  return (
    <div className={`manager ${className}`}>
      <div className="manager-header">
        <h2>{componentName.replace(/([A-Z])/g, ' $1').trim()}</h2>
      </div>
      
      <div className="manager-content">
        <div className="items-list">
          {items.map(item => (
            <div
              key={item.id}
              className={`item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => handleItemSelect(item)}
            >
              <div className="item-name">{item.name}</div>
              <div className="item-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        
        {selectedItem && (
          <div className="item-details">
            <h3>{selectedItem.name}</h3>
            <p>Created: {new Date(selectedItem.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(selectedItem.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;