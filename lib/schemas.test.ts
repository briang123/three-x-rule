import { 
  RemixResponseSchema, 
  SocialPostSchema, 
  ContentEnhancementSchema,
  schemas,
  type RemixResponse,
  type SocialPost,
  type ContentEnhancement
} from './schemas';

describe('Schemas', () => {
  describe('RemixResponseSchema', () => {
    it('should validate correct remix response', () => {
      const validData = {
        combinedAnswer: 'This is a combined answer',
        confidence: 0.85,
        reasoning: 'This reasoning explains the combination',
        sources: ['source1', 'source2'],
        improvements: ['improvement1', 'improvement2'],
      };

      const result = RemixResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid confidence values', () => {
      const invalidData = {
        combinedAnswer: 'This is a combined answer',
        confidence: 1.5, // Invalid: should be 0-1
        reasoning: 'This reasoning explains the combination',
        sources: ['source1'],
        improvements: ['improvement1'],
      };

      const result = RemixResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        combinedAnswer: 'This is a combined answer',
        confidence: 0.85,
        // Missing reasoning, sources, improvements
      };

      const result = RemixResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SocialPostSchema', () => {
    it('should validate correct social post', () => {
      const validData = {
        content: 'This is a social post content',
        hashtags: ['#test', '#social'],
        characterCount: 50,
        platform: 'twitter',
      };

      const result = SocialPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid platform values', () => {
      const invalidData = {
        content: 'This is a social post content',
        hashtags: ['#test'],
        characterCount: 50,
        platform: 'invalid-platform', // Invalid platform
      };

      const result = SocialPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative character count', () => {
      const invalidData = {
        content: 'This is a social post content',
        hashtags: ['#test'],
        characterCount: -10, // Invalid: should be positive
        platform: 'twitter',
      };

      const result = SocialPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ContentEnhancementSchema', () => {
    it('should validate correct content enhancement', () => {
      const validData = {
        enhancedContent: 'This is enhanced content',
        improvements: ['improvement1', 'improvement2'],
        factCheckResults: [
          {
            claim: 'This is a claim',
            verified: true,
            source: 'source1',
          },
        ],
        suggestions: ['suggestion1', 'suggestion2'],
      };

      const result = ContentEnhancementSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept fact check results without source', () => {
      const validData = {
        enhancedContent: 'This is enhanced content',
        improvements: ['improvement1'],
        factCheckResults: [
          {
            claim: 'This is a claim',
            verified: false,
            // source is optional
          },
        ],
        suggestions: ['suggestion1'],
      };

      const result = ContentEnhancementSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid fact check results', () => {
      const invalidData = {
        enhancedContent: 'This is enhanced content',
        improvements: ['improvement1'],
        factCheckResults: [
          {
            claim: 'This is a claim',
            verified: 'not-a-boolean', // Invalid: should be boolean
            source: 'source1',
          },
        ],
        suggestions: ['suggestion1'],
      };

      const result = ContentEnhancementSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('schemas object', () => {
    it('should export all schemas', () => {
      expect(schemas.remix).toBe(RemixResponseSchema);
      expect(schemas.socialPost).toBe(SocialPostSchema);
      expect(schemas.contentEnhancement).toBe(ContentEnhancementSchema);
    });

    it('should have correct structure', () => {
      expect(typeof schemas.remix).toBe('object');
      expect(typeof schemas.socialPost).toBe('object');
      expect(typeof schemas.contentEnhancement).toBe('object');
    });
  });

  describe('Type exports', () => {
    it('should export RemixResponse type', () => {
      const response: RemixResponse = {
        combinedAnswer: 'Test answer',
        confidence: 0.8,
        reasoning: 'Test reasoning',
        sources: ['source1'],
        improvements: ['improvement1'],
      };

      expect(response.combinedAnswer).toBe('Test answer');
      expect(response.confidence).toBe(0.8);
    });

    it('should export SocialPost type', () => {
      const post: SocialPost = {
        content: 'Test content',
        hashtags: ['#test'],
        characterCount: 20,
        platform: 'twitter',
      };

      expect(post.content).toBe('Test content');
      expect(post.platform).toBe('twitter');
    });

    it('should export ContentEnhancement type', () => {
      const enhancement: ContentEnhancement = {
        enhancedContent: 'Enhanced content',
        improvements: ['improvement1'],
        factCheckResults: [
          {
            claim: 'Test claim',
            verified: true,
          },
        ],
        suggestions: ['suggestion1'],
      };

      expect(enhancement.enhancedContent).toBe('Enhanced content');
      expect(enhancement.factCheckResults[0].verified).toBe(true);
    });
  });
}); 