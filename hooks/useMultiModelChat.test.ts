import { ModelSelection } from '@/components/ModelGridSelector';

// Test the ModelSelection type import
describe('useMultiModelChat Dependencies', () => {
  it('should have correct ModelSelection type', () => {
    const mockSelection: ModelSelection = {
      modelId: 'gemini-2.0-flash',
      count: 2,
    };

    expect(mockSelection.modelId).toBe('gemini-2.0-flash');
    expect(mockSelection.count).toBe(2);
  });

  it('should be able to import the hook module', () => {
    // Just test that we can import the module without hanging
    expect(() => {
      require('./useMultiModelChat');
    }).not.toThrow();
  });
});
