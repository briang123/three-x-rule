# Project Information

## AI Tip from Dylan Davis

### Links

https://www.youtube.com/@d-squared70
https://www.linkedin.com/in/dylantdavis/
https://dylandavis.net/
https://gradientlabs.co/

### Tip

Here's what actually works: **The 3x Rule.**

Ask the same question 3 different times. Get 3 different outputs. Pick the best parts from each.

​Example: Need a sales email? Don't ask once. Open 3 tabs, ask with the same prompt 3 times, compare results. Then feed all 3 into another AI asking it to combine the best elements.

​Why this works: AI is probabilistic (fancy word for unpredictable). Same input = different outputs every time.

## Overview

We are building a web app in Next.js with Typescript using Tailwind css and Framer Motion to solve the problem of getting the best response by leveraging multiple ai models so the best parts can be reasoned about.

## Defaults

1. Dark mode (supports light mode, but should not toggle to it)
2. "Select AI Models" section should appear (no pre-selected models)
3. Left side nav shall be minimized, with ability to expand
4. Settings shall be disabled for now until we work on settings screen
5. Background should have an animated aurora (https://www.reactbits.dev/backgrounds/aurora)
6. Chat message input container shall be a sticky at the bottom
7. Any content on page shall scroll behind chat input container
8. Smooth animations using Framer Motion

## Settings

- The left side nav shall be minimized by default, but have the ability to expand

### Eventual Requirements

- Allow user to add new providers
- Allow user to provide provider API key (encrypt in localstorage)

## Chat Message Input

1. By default, the height of text area is 1 row when user doesn't set focus in text area.
2. when user starts typing and adding new rows, the text area should resize with it until it reaches 8 rows; after which the text area will get a scrollbar when adding a 9th row. When user removes lines it will size back down accordingly.
3. when clearing the text in text area and still have cursor focused in text area, the size should still be 1 row.

When the text area resizes, I want the other controls to respect the resizing and not have the text area content bleed over and overlap existing controls. When we reach the 8th row, the text area doesn't grow anymore but shows the scrollbar in text area, all the other controls would be where they need to be. When removing lines, the text area would shrink to 1 row, as described above.

I do not want the text that I'm typing to overlap the controls below the textarea. The size of the text area should be known at all times so the system knows how to adjust the different controls so that the UI looks correct

### Challenges:

1. we don't want animations to fire (jankiness) after typing first character
2. we want to maintain auto resize of text area to a max size without impacting animations
3. We're using a next.js app with tailwind css. Framer motion for animations

## Tools Row

- File attachment button (+ icon) to attach files for ai context
- If >= 1 ai models selected, then show up to 3 ai agent badges with qty and include a button so user can change the selected ai models button (reload icon) that when pressed will hide the ai responses and show the ai selection section with selected models pre-selected.
- If no ai models are selected and user closes ai selection section then show a button next to "+" button to "Select Models", that when pressed will show the ai selection section.
- Remix (with Model selector) button to take all previous ai responses and use them to send to ai to syntesize to get back a new better response.
- Send button (up icon) that will send prompt to all selected models. Will be disabled when the prompt is empty

## AI Response Types

### General Response

Response should include the following:

- show badge with number. A user can choose the number of times they want an ai model to process their prompt and provide a response for each. This number represents that count by ai model. Here are some examples:
  - If user sent prompt to 4 different models with qty 1 for each, then user should see 4 response with numbers 1,2,3, or 4 as the number
  - if user sent prompt to 2 different models with qty 2 for each, then each model will be either 1 or 2 as the number
- show badge of the ai model id (right aligned)
- badge colors should be color themed for easy visual clarity

### Remixed Response

- new remixed ai responses should be the best parts from the previous general ai responses that precede it, but only the ones since the last remixed response
- remixed responses have their own theme

#### Example (here's how it could look):

1. general response 1
2. general response 2
3. general response 3
4. remixed response for 1,2,3
5. social post response
6. social post response
7. remixed response for 1,2,3 (new remix response)
   (user enters new prompt)
8. general response 1
9. general response 2
10. remixed response for 8,9
11. remixed response for 8,9 (new remix response)

### Social Posts

- social posts should be formatted properly based on content type
- ai should add unique delimiter to allow front end to split up responses (ie. --%--)
- should include actual color branded logo in top left
- should include color branded badge with content type
- should include color branded badge with ai model id
- should allow user to change the length and format of social posts from within container (ie. shorter, longer, redo, etc)

## Use Cases

use case 1: Initial page load (Most common)

1. user selects one or more ai models
2. user enters prompt
3. user clicks submit button
4. ai selection section hidden and selected model appear in tools row below chat input message via smooth animation (change ai model button appears)
5. ai api request sent and response received
6. ai response appended to existing results (if applicable)

use case 2: Initial page load (Less common)

1. user bypasses selecting one or more ai models
2. user enters prompt
3. user clicks submit button
4. user prompted to use default ai model and agrees
5. ai model selected and selected ai model appears in tools row below chat input message via smooth animation (change ai model button appears)
6. ai selection section hidden and awaits for ai response
7. ai api request sent and response received
8. ai response appended to existing results (if applicable)

use case 3: Change ai model from closed state (previously selected model)

1. user clicks the "change ai model" button in tools row below the chat message input
2. ai model selection section appears
3. user changes ai model selection and qty
4. user closes window by tapping the "x" button
5. user clicks submit button
6. ai api requst sent with prompt to selected models
7. ai response appended to existing results (if applicable)

use case 4: Select ai model from closed state (closed ai selections window without selections)

1. user clicks the "Select Models" button in tools row below the chat message input
2. ai model selection section appears
3. user selects ai model and qty
4. user clicks submit button
5. ai api requst sent with prompt to selected models
6. ai response appended to existing results (if applicable)

use case 5: User wants a new chat

1. user clicks the "New chat" button
2. all previous ai responses are cleared
3. chat message input is cleared regardless if prompt is sent (resets the field)
4. ai selections section appears so user can select ai models (leaves previous selections in place)
5. user selects ai model and qty
6. user clicks submit button
7. ai api requst sent with prompt to selected models
8. ai response appended to screen

use case 6: User wants to create social posts

1. user clicks the "Social posts" button
2. social posts drawer opens
3. user enters social details
4. user clicks "Generate Social Posts" button
5. social posts drawer closes
6. ai api request sent with prompt to selected model
7. ai response appended and properly formated based on content type (ie. tweet, post, etc.)

## Project Structure

// TODO: AI TO PROVIDE

## Refactoring Code and UI

- Refactorings should be small and testable
- Should refactor to custom hooks to keep project DRY
- Common UI should refactor to common functional components
- We may want to refactor state to use global state management tool
- Use constants where applicable
- User helper and utility functions where applicable

## Testing

1. Install testing frameworks Jest and Playwright and create npm scripts to support the various test runners.
2. Jest unit tests should be inline next to the files they're testing
3. Playwright tests should be in a root folder /e2e
4. Should have utils, lib, selectors, constants files to support the tests

## Debugging

AI Should:

1. Try to test its own changes without user interaction
2. Review codebase to understand context
3. Add console logs to help troubleshoot issues (clean them up after)
4. Go into auto-run mode when making changes and testing until resolved or dev jumps in
5. Create tests after feature is approved and working (Will help identify regressions)
6. Changes should stay focused on the problem at-hand and not deviate
7. Should ask clarifying questions before moving forward
8. Should create documentation explaining issues and resolutions
