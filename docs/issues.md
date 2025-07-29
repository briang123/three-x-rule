# Issues

## Resolved Issues

- [x] When I click "New chat" button, the chat input doesn't reset at all times

  - **Fixed**: Added additional useEffect in both ChatInput and ChatInputMessage components to ensure text/prompt state is reset when currentMessage prop becomes empty
  - **Root Cause**: The useEffect that watches currentMessage only triggered when the prop changed, but if currentMessage was already empty when New Chat was clicked, the effect wouldn't fire
  - **Solution**: Added a second useEffect that specifically checks if currentMessage is empty and the local state has content, then forces a reset
  - **Test**: Created comprehensive test suite to verify the fix works correctly
  - **Documentation**: [Chat Input Reset Fix](chat-input.md)

- [x] When I load the initial page and the ai model selection section appears, I'm unable to close the window

  - **Fixed**: Added missing prop connections and fixed rendering logic to prevent duplicate sections

- [x] When I have selected models and submit my prompt to ai, the model (qty) badges are not appearing in the tools row when it should be.

  - **Fixed**: Resolved timing issue where model selections were being cleared when AI selection was auto-hidden
  - **Root Cause**: The `handleToggleAISelection` function was clearing model selections when AI selection was auto-hidden after content was received
  - **Solution**: Modified the function to only clear selections when manually closing (not auto-hiding) and implemented pending orchestration mechanism to handle asynchronous state updates
  - **Documentation**: [Model Badges Fix](MODEL_BADGES_FIX.md)
  - **Tests**: Added comprehensive test suite for `AnimatedModelBadges` and `ChatInputMessage` components

- [x] When I submit where total of all selected ai models qty > 1 and get responses back, the "Remix" button is disabled when it should be enabled

  - **Fixed**: Updated the `remixDisabled` logic to properly check for responses in `columnResponses` instead of `originalResponses`
  - **Root Cause**: The `remixDisabled` calculation was checking `originalResponses` which stores the final accumulated response, but should check `columnResponses` which contains the actual response arrays
  - **Solution**: Changed the logic from `!Object.values(originalResponses).some((response) => response.trim() !== '')` to `!Object.values(columnResponses).some((responses) => responses.length > 0)`
  - **Additional Fixes**: Updated related remix functionality to use `columnResponses` consistently and fixed `availableColumns` prop type mismatch
  - **Tests**: Added comprehensive test file to verify remix button logic
  - **Documentation**: Created comprehensive requirements document at `docs/remix-button-requirements.md`
  - **Status**: ✅ **FULLY RESOLVED** - All requirements implemented, tested, and documented

- [x] Unable to click the "+" button to attach a file

  - **Fixed**: Added file attachment functionality to ChatInputMessage component
  - **Root Cause**: The "+" button was just a static button without any click handler or file input functionality
  - **Solution**: Implemented complete file attachment system including:
    - File selection via + button with click handler
    - File validation (size limit 10MB, supported file types)
    - File display with icons and hover tooltips
    - File removal functionality
    - File preview/download functionality
    - Submission with attachments
  - **Mock API**: Implemented comprehensive mock API functionality for testing and development
  - **Error Handling**: Added graceful error handling for API rate limits, authentication errors, model errors, and file processing errors
  - **Tests**: Added comprehensive test suite for file attachment functionality including mock API integration tests
  - **Documentation**: Created comprehensive documentation at `docs/FILE_ATTACHMENTS_README.md`
  - **Status**: ✅ **FULLY RESOLVED** - All file attachment features implemented, tested, and documented with mock API support

## Open Issues

- [ ] The chat input message container should not have a top border and the background should be transparent
- [ ] When i select an ai model and the "Select AI Models" section hides, i don't see the ai model badge in the tools row
- [ ] The left side nav is impacting the main content alignment making the content above the chat input off-centered. The left side nav should not impact the main body content styling.

![Left Nav Impacts Main Content Alignment](<Screenshot 2025-07-28 145836.png>)

## Tests

- **Tests**: Added comprehensive test suite for `AnimatedModelBadges` and `ChatInputMessage` components
- **Tests**: Added comprehensive test suite for file attachment functionality including:
  - File selection and validation
  - File display and UI interactions
  - File removal and management
  - File preview/download functionality
  - Submission with attachments
  - Error handling for invalid files
