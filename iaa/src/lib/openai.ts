export async function generateDailyTodos(
  goal: string,
  duration: string,
  daysElapsed: number,
  totalDays: number,
  openaiApiKey: string
): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates actionable daily TODO items to help users achieve their goals. Generate 3-5 specific, actionable tasks for today.',
        },
        {
          role: 'user',
          content: `Goal: ${goal}\nDuration: ${duration}\nProgress: Day ${daysElapsed} of ${totalDays}\n\nGenerate 3-5 specific, actionable TODO items for today that will help me progress toward this goal. Return only the TODO items, one per line, without numbering or bullet points.`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate TODOs');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  return content
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
}
