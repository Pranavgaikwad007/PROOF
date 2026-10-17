import { config } from '../config/index.js';
import { ASSISTANCE_LEVELS, buildSystemPrompt, type AssistanceLevel, type CoachPromptContext } from './prompts.js';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: Error) => void;
}

export class AiCoachService {
  /**
   * Determine the requested assistance level from the candidate prompt.
   */
  public detectRequestedLevel(prompt: string): AssistanceLevel {
    const lower = prompt.toLowerCase();
    if (lower.includes('write the code') || lower.includes('implement this for me') || lower.includes('generate')) {
      return ASSISTANCE_LEVELS.GENERATE;
    }
    if (lower.includes('why does my') || lower.includes('fails') || lower.includes('error') || lower.includes('assertion') || lower.includes('debug')) {
      return ASSISTANCE_LEVELS.VERIFY;
    }
    if (lower.includes('approach') || lower.includes('how should i structure') || lower.includes('algorithm') || lower.includes('is binary search')) {
      return ASSISTANCE_LEVELS.GUIDE;
    }
    return ASSISTANCE_LEVELS.CLARIFY;
  }

  /**
   * Generate AI coach response with streaming support
   */
  async streamResponse(
    prompt: string,
    context: CoachPromptContext,
    callbacks: StreamCallbacks,
  ): Promise<string> {
    const requestedLevel = this.detectRequestedLevel(prompt);
    const effectiveLevel = Math.min(requestedLevel, context.aiPolicyLevel) as AssistanceLevel;

    // Check if live OpenAI-compatible key is set
    if (config.OPENAI_API_KEY && config.OPENAI_API_KEY.trim() !== '') {
      try {
        return await this.callLiveLlm(prompt, context, effectiveLevel, callbacks);
      } catch (err) {
        console.warn('[AiCoach] Live LLM call failed, falling back to Mock Coach:', (err as Error).message);
      }
    }

    // Default: Mock Coach for demo resilience
    return await this.callMockCoach(prompt, context, effectiveLevel, callbacks);
  }

  private async callLiveLlm(
    prompt: string,
    context: CoachPromptContext,
    effectiveLevel: AssistanceLevel,
    callbacks: StreamCallbacks,
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(context, effectiveLevel);

    const res = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.OPENAI_MODEL,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`OpenAI API returned status ${res.status}: ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            callbacks.onChunk(delta);
          }
        } catch {
          // Ignore incomplete JSON chunks
        }
      }
    }

    callbacks.onDone(fullText);
    return fullText;
  }

  private async callMockCoach(
    prompt: string,
    context: CoachPromptContext,
    effectiveLevel: AssistanceLevel,
    callbacks: StreamCallbacks,
  ): Promise<string> {
    const lower = prompt.toLowerCase();
    let reply = '';

    // If Level 4 is requested but policy blocks it:
    if (this.detectRequestedLevel(prompt) === 4 && context.aiPolicyLevel < 4) {
      reply = `Policy Notice: The assessment AI policy is set to Level ${context.aiPolicyLevel} (guidance & verification only). Full code generation is restricted. However, conceptually: review your conditional branch logic and test against boundary inputs.`;
    } else if (lower.includes('binary search') || lower.includes('search_range') || lower.includes('first and last')) {
      if (effectiveLevel === 2) {
        reply = 'Binary search is appropriate for a sorted array. A common pattern is two passes: one biased toward the left bound and one toward the right bound, each returning an index or -1.';
      } else {
        reply = 'Your guard is `while left < right`, so the iteration ends when left and right are equal without evaluating that index. You also only track `first`, so the pair can never be complete. Run the search twice with a helper that accepts a flag, biasing `right = mid - 1` for the first occurrence and `left = mid + 1` for the last.';
      }
    } else if (lower.includes('why does my loop stop') || lower.includes('[-1, -1] instead of [2, 2]')) {
      reply = 'Your guard is `while left < right`, so the iteration ends when left and right are equal without evaluating that index. You also only track `first`, so the pair can never be complete. Run the search twice with a helper that accepts a flag, biasing `right = mid - 1` for the first occurrence and `left = mid + 1` for the last.';
    } else if (lower.includes('task') || lower.includes('empty query') || lower.includes('filter')) {
      if (lower.includes('empty query') || lower.includes('empty search')) {
        reply = 'In your search implementation, checking `if not query:` should return all tasks instead of an empty list. When a user clears or leaves the search box blank, the expected UX convention is to display the unfiltered (or status-filtered) task catalog rather than zero items.';
      } else {
        reply = 'For the Task Manager, ensure tasks maintain unique IDs and preserve priority ordering. When filtering by status, make sure an empty or missing filter string defaults to returning all active items.';
      }
    } else {
      reply = `I have reviewed your query. Consider breaking the problem down: 1) verify edge case inputs (e.g. empty inputs or boundary values), 2) ensure loop termination invariants cover the final element, and 3) check return type conformity against the problem specification.`;
    }

    // Simulate streaming chunks for realistic UI delivery
    const words = reply.split(' ');
    let streamed = '';
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      streamed += chunk;
      callbacks.onChunk(chunk);
      // Small delay simulation
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    callbacks.onDone(streamed);
    return streamed;
  }
}

export const aiCoach = new AiCoachService();
