// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ParkingCard from './ParkingCard';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../hooks/useThemeClasses', () => ({
  useThemeClasses: () => ({
    cardBg: 'bg-white',
    cardBorder: 'border-gray-200',
    border: 'border-gray-200',
    text: 'text-black',
    textSecondary: 'text-gray-500',
    textMuted: 'text-gray-400',
    status: {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800'
    },
    gradient: {
      accent: 'from-blue-500 to-purple-500',
      primary: 'from-blue-500 to-purple-500'
    },
    cardBgSecondary: 'bg-gray-50',
    hover: 'hover:bg-gray-100'
  })
}));

const mockSlot = {
  _id: 'slot-1',
  name: 'Test Slot',
  location: '123 Test Ave',
  pricePerHour: 10,
  status: 'available',
  capacity: 100,
  availableSlots: 50,
  distance: '1 km',
  rating: 4.5,
  images: [],
  description: '',
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('ParkingCard Markdown Rendering', () => {
  it('should render basic markdown text correctly', () => {
    const slotWithMarkdown = {
      ...mockSlot,
      description: 'This is **bold** and *italic* text.',
    };

    renderWithRouter(
      <ParkingCard
        slot={slotWithMarkdown}
        userLocation={null}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onBookNow={vi.fn()}
        onShowPrediction={vi.fn()}
        onShowFloors={vi.fn()}
      />
    );

    // react-markdown renders bold as <strong> and italic as <em>
    const boldText = screen.getByText('bold');
    const italicText = screen.getByText('italic');

    expect(boldText.tagName.toLowerCase()).toBe('strong');
    expect(italicText.tagName.toLowerCase()).toBe('em');
    expect(screen.getByText(/This is/)).toBeInTheDocument();
  });

  it('should render markdown lists correctly', () => {
    const slotWithList = {
      ...mockSlot,
      description: '- Item 1\n- Item 2\n- Item 3',
    };

    renderWithRouter(
      <ParkingCard
        slot={slotWithList}
        userLocation={null}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onBookNow={vi.fn()}
        onShowPrediction={vi.fn()}
        onShowFloors={vi.fn()}
      />
    );

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('Item 1');
    expect(listItems[1]).toHaveTextContent('Item 2');
    expect(listItems[2]).toHaveTextContent('Item 3');
  });

  it('should safely sanitize malicious scripts (XSS attack test)', () => {
    const maliciousSlot = {
      ...mockSlot,
      description: 'Hello <script>alert("xss")</script> [click here](javascript:alert("xss"))',
    };

    renderWithRouter(
      <ParkingCard
        slot={maliciousSlot}
        userLocation={null}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onBookNow={vi.fn()}
        onShowPrediction={vi.fn()}
        onShowFloors={vi.fn()}
      />
    );

    // The script tag should be completely stripped out
    const scriptTags = document.querySelectorAll('script');
    expect(scriptTags.length).toBe(0);

    // The javascript: URL should be stripped from the href, usually leaving href="" or removing the element
    const link = screen.queryByRole('link', { name: /click here/i });
    if (link) {
      expect(link.getAttribute('href')).not.toContain('javascript:');
    }
  });

  it('should not break if description is empty or missing', () => {
    const emptySlot = {
      ...mockSlot,
      description: '',
    };

    const { container } = renderWithRouter(
      <ParkingCard
        slot={emptySlot}
        userLocation={null}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onBookNow={vi.fn()}
        onShowPrediction={vi.fn()}
        onShowFloors={vi.fn()}
      />
    );

    // Card should render normally without throwing errors
    expect(screen.getAllByText('Test Slot').length).toBeGreaterThan(0);
    
    // The prose container shouldn't exist if there's no description
    const markdownContainers = container.getElementsByClassName('prose');
    expect(markdownContainers.length).toBe(0);
  });
});
