import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialPlatformFactory from './SocialPlatformFactory';
import { SocialPostConfig } from './types';

// Mock the platform components
jest.mock('./TwitterPlatform', () => {
  return function MockTwitterPlatform() {
    return <div data-testid="twitter-platform">Twitter Platform</div>;
  };
});

jest.mock('./LinkedInPlatform', () => {
  return function MockLinkedInPlatform() {
    return <div data-testid="linkedin-platform">LinkedIn Platform</div>;
  };
});

jest.mock('./InstagramPlatform', () => {
  return function MockInstagramPlatform() {
    return <div data-testid="instagram-platform">Instagram Platform</div>;
  };
});

jest.mock('./FacebookPlatform', () => {
  return function MockFacebookPlatform() {
    return <div data-testid="facebook-platform">Facebook Platform</div>;
  };
});

jest.mock('./TikTokPlatform', () => {
  return function MockTikTokPlatform() {
    return <div data-testid="tiktok-platform">TikTok Platform</div>;
  };
});

jest.mock('./BaseSocialPlatform', () => {
  return function MockBaseSocialPlatform() {
    return <div data-testid="base-platform">Base Platform</div>;
  };
});

const mockConfig: SocialPostConfig = {
  platform: 'twitter',
  modelId: 'test-model',
  postType: 'tweet',
  numberOfPosts: 1,
  characterLimit: 280,
  isThreaded: false,
};

const defaultProps = {
  config: mockConfig,
  response: 'Test response',
  isGenerating: false,
  isBorderFaded: false,
  onAddSelection: jest.fn(),
};

describe('SocialPlatformFactory', () => {
  it('renders Twitter platform for twitter config', () => {
    render(<SocialPlatformFactory {...defaultProps} />);
    expect(screen.getByTestId('twitter-platform')).toBeInTheDocument();
  });

  it('renders LinkedIn platform for linkedin config', () => {
    const linkedinConfig = { ...mockConfig, platform: 'linkedin' };
    render(<SocialPlatformFactory {...defaultProps} config={linkedinConfig} />);
    expect(screen.getByTestId('linkedin-platform')).toBeInTheDocument();
  });

  it('renders Instagram platform for instagram config', () => {
    const instagramConfig = { ...mockConfig, platform: 'instagram' };
    render(<SocialPlatformFactory {...defaultProps} config={instagramConfig} />);
    expect(screen.getByTestId('instagram-platform')).toBeInTheDocument();
  });

  it('renders Facebook platform for facebook config', () => {
    const facebookConfig = { ...mockConfig, platform: 'facebook' };
    render(<SocialPlatformFactory {...defaultProps} config={facebookConfig} />);
    expect(screen.getByTestId('facebook-platform')).toBeInTheDocument();
  });

  it('renders TikTok platform for tiktok config', () => {
    const tiktokConfig = { ...mockConfig, platform: 'tiktok' };
    render(<SocialPlatformFactory {...defaultProps} config={tiktokConfig} />);
    expect(screen.getByTestId('tiktok-platform')).toBeInTheDocument();
  });

  it('renders base platform for unknown platform', () => {
    const unknownConfig = { ...mockConfig, platform: 'unknown' };
    render(<SocialPlatformFactory {...defaultProps} config={unknownConfig} />);
    expect(screen.getByTestId('base-platform')).toBeInTheDocument();
  });
});
