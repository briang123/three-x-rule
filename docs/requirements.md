# Project Information

## AI Tip from Dylan Davis

### Links

- https://www.youtube.com/@d-squared70
- https://www.linkedin.com/in/dylantdavis/
- https://dylandavis.net/
- https://gradientlabs.co/

### Tip

Here's what actually works: **The 3x Rule.**

Ask the same question 3 different times. Get 3 different outputs. Pick the best parts from each.

Example: Need a sales email? Don't ask once. Open 3 tabs, ask with the same prompt 3 times, compare results. Then feed all 3 into another AI asking it to combine the best elements.

Why this works: AI is probabilistic (fancy word for unpredictable). Same input = different outputs every time.

## Overview

We are building a web app in Next.js with TypeScript using Tailwind CSS and Framer Motion to solve the problem of getting the best response by leveraging multiple AI models so the best parts can be reasoned about.

## Defaults

1. Dark mode (supports light mode, but should not toggle to it)
2. "Select AI Models" section should appear (no pre-selected models)
3. Left side nav shall be minimized, with ability to expand (when expanded shall not shift any of the main body content)
4. Settings shall be disabled for now until we work on settings screen
5. Background should have an animated aurora (https://www.reactbits.dev/backgrounds/aurora)
6. Chat message input container shall be sticky at the bottom
7. Any content on page shall scroll behind chat input container
8. Smooth animations using Framer Motion

## Settings

- The left side nav shall be minimized by default, but have the ability to expand

### Eventual Requirements

- Allow user to add new providers
- Allow user to provide provider API key (encrypt in localStorage)

## Chat Message Input

We are using `ChatInputMessage.tsx`, not `ChatInput.tsx`

1. By default, the height of textarea is 1 row when user doesn't set focus in textarea.
2. When user starts typing and adding new rows, the textarea should resize with it until it reaches 8 rows; after which the textarea will get a scrollbar when adding a 9th row. When user removes lines, it will size back down accordingly.
3. When clearing the text in textarea and still have cursor focused in textarea, the size should still be 1 row.

When the textarea resizes, I want the other controls to respect the resizing and not have the textarea content bleed over and overlap existing controls. When we reach the 8th row, the textarea doesn't grow anymore but shows the scrollbar in textarea. All the other controls would be where they need to be. When removing lines, the textarea would shrink to 1 row, as described above.

I do not want the text that I'm typing to overlap the controls below the textarea. The size of the textarea should be known at all times so the system knows how to adjust the different controls so that the UI looks correct.

### Challenges

1. We don't want animations to fire (jankiness) after typing the first character
2. We want to maintain auto-resize of textarea to a max size without impacting animations
3. We're using a Next.js app with Tailwind CSS and Framer Motion for animations

## Tools Row

- Below the chat input message textarea
- File attachment button (+ icon) to attach files for AI context
- If ≥ 1 AI models selected, then show up to 3 AI agent badges with qty and include a button so user can change the selected AI models (reload icon) that, when pressed, will hide the AI responses and show the AI selection section with selected models pre-selected
- If no AI models are selected and user closes AI selection section, then show a button next to "+" button to "Select Models" that, when pressed, will show the AI selection section
- Remix (with model selector) button to take all previous AI responses and use them to send to AI to synthesize to get back a new better response
- Send button (up icon) that will send prompt to all selected models — disabled when the prompt is empty

### File Attachments

- Should allow for multiple file attachments
- Attachments will appear to the right of "+" button as circle badges.
- Hovering over file badges will show file metadata
- Will be included as AI context

Supported file types

```
'text/plain',
'text/markdown',
'text/x-markdown',
'application/pdf',
'application/msword',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'application/vnd.ms-excel',
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
'image/jpeg',
'image/jpg',
'image/png',
'image/gif',
```

## AI Response Types

### General Response

Response should include the following:

- Show badge with number. A user can choose the number of times they want an AI model to process their prompt and provide a response for each. This number represents that count by AI model. Examples:
  - If user sent prompt to 4 different models with qty 1 for each, then user should see 4 responses with numbers 1, 2, 3, 4 as the number
  - If user sent prompt to 2 different models with qty 2 for each, then each model will be either 1 or 2 as the number
- Show badge of the AI model ID (right-aligned)
- Badge colors should be color-themed for easy visual clarity

### Remixed Response

- If user has selected AI models where total across all models > 1 then Remix button should be enabled; otherwise, disabled
- New remixed AI responses should be the best parts from the previous general AI responses that precede it, but only the ones since the last remixed response
- Remixed responses have their own theme

#### Example (here's how it could look):

1. General response 1
2. General response 2
3. General response 3
4. Remixed response for 1, 2, 3
5. Social post response
6. Social post response
7. Remixed response for 1, 2, 3 (new remix response)  
   (user enters new prompt)
8. General response 1
9. General response 2
10. Remixed response for 8, 9
11. Remixed response for 8, 9 (new remix response)

### Social Posts

- Social posts should be formatted properly based on content type
- AI should add unique delimiter to allow front end to split up responses (e.g. `--%--`)
- Should include actual color-branded logo in top left
- Should include color-branded badge with content type
- Should include color-branded badge with AI model ID
- Should allow user to change the length and format of social posts from within container (e.g. shorter, longer, redo, etc.)

## Use Cases

### Use Case 1: Initial page load (Most common)

1. User selects one or more AI models
2. User enters prompt
3. User clicks submit button
4. AI selection section hidden and selected models appear in tools row below chat input message via smooth animation (change AI model button appears)
5. AI API request sent and response received
6. AI response appended to existing results (if applicable)

### Use Case 2: Initial page load (Less common)

1. User bypasses selecting one or more AI models
2. User enters prompt
3. User clicks submit button
4. User prompted to use default AI model and agrees
5. AI model selected and selected AI model appears in tools row below chat input message via smooth animation (change AI model button appears)
6. AI selection section hidden and awaits AI response
7. AI API request sent and response received
8. AI response appended to existing results (if applicable)

### Use Case 3: Change AI model from closed state (previously selected model)

1. User clicks the "Change AI Model" button in tools row below the chat message input
2. AI model selection section appears
3. User changes AI model selection and qty
4. User closes window by tapping the "X" button
5. User clicks submit button
6. AI API request sent with prompt to selected models
7. AI response appended to existing results (if applicable)

### Use Case 4: Select AI model from closed state (closed AI selections window without selections)

1. User clicks the "Select Models" button in tools row below the chat message input
2. AI model selection section appears
3. User selects AI model and qty
4. User clicks submit button
5. AI API request sent with prompt to selected models
6. AI response appended to existing results (if applicable)

### Use Case 5: User wants a new chat

1. User clicks the "New Chat" button
2. All previous AI responses are cleared
3. Chat message input is cleared regardless if prompt is sent (resets the field)
4. AI selections section appears so user can select AI models (leaves previous selections in place)
5. User selects AI model and qty
6. User clicks submit button
7. AI API request sent with prompt to selected models
8. AI response appended to screen

### Use Case 6: User wants to create social posts

1. User clicks the "Social Posts" button
2. Social posts drawer opens
3. User enters social details
4. User clicks "Generate Social Posts" button
5. Social posts drawer closes
6. AI API request sent with prompt to selected model
7. AI response appended and properly formatted based on content type (e.g. tweet, post, etc.)

### Use Case 7: User wants to provide files for context

1. User can hover over the "+" button to see supported file types
2. To upload a file, the user clicks the "+" button
3. User selects one or more files for upload (Max 10MB)
4. Files get attached below the chat message and to the right of "+" button in stacked format
5. If user wants to delete a file, they will hover over file icon (animate to top later) and click the "x" button
6. If user wants to view file metadata, they will hover over the stacked file icon
7. If user wants to download the file, they can click on the icon

## Project Structure

// TODO: AI TO PROVIDE

## Refactoring Code and UI

- Refactorings should be small and testable
- Should refactor to custom hooks to keep project DRY
- Common UI should refactor to common functional components
- We may want to refactor state to use global state management tool
- Use constants where applicable
- Use helper and utility functions where applicable

## Testing

1. Install testing frameworks Jest and Playwright and create npm scripts to support the various test runners
2. Jest unit tests should be inline next to the files they're testing
3. Playwright tests should be in a root folder `/e2e`
4. Should have `utils`, `lib`, `selectors`, `constants` files to support the tests

## Debugging

AI Should:

1. Try to test its own changes without user interaction
2. Review codebase to understand context
3. Add console logs to help troubleshoot issues (clean them up after)
4. Go into auto-run mode when making changes and testing until resolved or dev jumps in
5. Create tests after feature is approved and working (will help identify regressions)
6. Changes should stay focused on the problem at hand and not deviate
7. Should ask clarifying questions before moving forward
8. Should create documentation explaining issues and resolutions

## Screenshots

### Top Nav Buttons

![Top Nav Buttons](<Screenshot 2025-07-28 145400.png>)

### Left Nav Bar

![Collapsed Left Nav](<Screenshot 2025-07-28 145459.png>)

![Expanded Left Nav](<Screenshot 2025-07-28 145630.png>)

### Select AI Models section

![AI Model Selection](<Screenshot 2025-07-28 145122.png>)

![Selected AI Models in AI Model Selection](<Screenshot 2025-07-28 150106.png>)

### Chat Input Message (Default View)

![Default Chat Message](<Screenshot 2025-07-28 145237.png>)

#### Models

![No Models Selected Chat Message](<Screenshot 2025-07-28 145940.png>)

![One Model Selected Chat Message](<Screenshot 2025-07-28 153503.png>)

![3 Models Selected Chat Message](<Screenshot 2025-07-28 153807.png>)

#### Remix

![2+ Qty Models, AI Response, Remix Button Chat Message](<Screenshot 2025-07-28 170112.png>)

#### File Attachments

![Stacked File Attachments Chat Message](<Screenshot 2025-07-28 180121.png>)

![Hover Plus button, Popover Chat Message](<Screenshot 2025-07-28 180527.png>)

![Hover Added File button, Popover Chat Message](<Screenshot 2025-07-28 180350.png>)

### Submitting Prompt

![No Previously Selected Model when Submitting](<Screenshot 2025-07-28 150239.png>)

![Remix button with Models](<Screenshot 2025-07-28 165904.png>)

### AI Content Type Responses

#### General

![General Content Type](<Screenshot 2025-07-28 154203.png>)

#### Remix

#### Social Posts

## New UX

### AI Model Selection

In efforts to simplify:

1. Create a modal window (new component) that has a smooth animation when opening and closing. Modal should have a border and medium soft shadows
2. The modal window should have all the same elements as what are being displayed with the exception of the Header text
3. Header Text should be centered vertically and horizontally on the page, but only if there isn't any ai responses rendered on the page.
4. When a user initially loads the page, show the modal window should appear
5. The user should be able to dismiss the modal clicking the "x" or tapping outside the modal window
6. To access the ai models if in a closed state, the user should be able to click on a badge named ("Models: {x}, Responses: {y}"). Clicking this will open the modal.
7. When closing the modal, the badge shall be updated with latest selections and qty

#### Use Cases

1. Use Case 1: Picks models first, then prompts

- Initial page load
- Show modal
- User selects model(s)
- User closes modal
- Model badge that has "Models: {x}, Responses: {y}" appears to right of File attachments
- Clicking model badge will open modal with all models selected and qty correct
- User enters prompts
- User submits prompt
- Request sent to AI endpoint
- Receives AI response
- Render AI response to screen

2. Use Case 2: Enters prompt, then selects models

- Initial page load
- Show modal
- User dismisses modal or clicks "X" button
- Model badge that has "Select Model" appears to right of file attachments
- User enters prompt
- User clicks "Select Model"
- Show modal
- User selects model(s)
- User closes modal
- Model badge that has "Models: {x}, Responses: {y}" appears to right of File attachments
- User submits prompt
- Request sent to AI endpoint
- Receives AI response
- Render AI response to screen

3. Use Case 3: Enters prompt, then accepts default model

- Initial page load
- Show modal
- User dismisses modal or clicks "X" button
- Model badge that has "Select Model" appears to right of file attachments
- User enters prompt
- User submits prompt
- User gets confirmation window to agree to default model
- User agrees to the default model
- Model badge that has "Models: 1, Responses: 1" appears to right of File attachments
- Request sent to AI endpoint
- Receives AI response
- Render AI response to screen

Notes: Create tests when for new component
