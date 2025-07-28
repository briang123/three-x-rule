I'm not crazy about the ux once models have been selected and user submits their prompt to ai. I would like to see about animating and orchestrating the selecte ai models section. Can we give the following a try?

When a user submits prompt after selecting ai models, we don't need to have them front and center metaphorically. At this time, we're simply working with the selected models. we still need to be able to change the selected models, so we'll need an easy way to do that and I think showing them where they appear by default works fine; however, let's try the following orchestration steps:

1. The ai models are selected and user clicks send button to initiate api request
2. The selected model badges animate and shrink to smaller size via a motion.path to the tools row under the chat input message box
3. The entire "Select AI Models" section animates/fades away on the same motion.path
4. We'll need a way to update the selected models, so we'll need a small icon button to restore the "Select AI Models" section on the page like it was when the page first loaded

Improvements

- Need a way to hide the "Select AI Models" section. The section will hide in the tool row below the chat input message box.
- After restoring the "Select AI Models" section when there are models already selected, when i un select one of the models, the entire section re-renders, which is not good UX. I should not see a full re-render of the section, but insted just unselect the model. If I proceed to unselect 2nd model, then it functions normally without the re-render.
- I would like to see the selected model badges shrink in size, animate, and move towards on some path to the tools row under the chat input message box
-

both scenarios there are ai models selected

1. user selects a model, types message, submits, api request sent.
2. user types message, submits, gets confirmation modal, agrees to selected model (model gets auto-selected), api request sent

It needs to work in both these cases.

STR
(no ai model selected)

1. type prompt, click send
2. agree to default model
3. restore models
4. close models
5. observe error

STR
(no ai model selected)

1. type prompt, click send
2. agree to default model
3. restore models
4. close models
5. no error, but selected model doesn't get restored to toolbar row under message box

additionally, when i close ai models section without selecting model, the "select models" badge never disappears when ai models section is open

How I want this to work once a model is selected:

1. When "Select AI Model" section is open and I have models already selected
