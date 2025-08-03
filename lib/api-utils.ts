const createRequestBody = (prompt: string, model: string) => ({
  messages: [{ role: 'user' as const, content: prompt }],
  model,
  stream: true,
});

export const handleStreamResponse = async (
  response: Response,
  onChunk: (content: string) => void,
  onComplete: (accumulatedResponse: string) => void,
) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  let accumulatedResponse = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.data?.content) {
            accumulatedResponse += parsed.data.content;
            onChunk(parsed.data.content);
          } else if (!parsed.success) {
            throw new Error(parsed.error || 'API request failed');
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }

  onComplete(accumulatedResponse);
};

export const sendChatRequest = async (prompt: string, model: string, attachments?: File[]) => {
  const requestBody = createRequestBody(prompt, model);

  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(requestBody));
    attachments.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    return fetch('/api/chat/with-attachments', {
      method: 'POST',
      body: formData,
    });
  }

  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
};
