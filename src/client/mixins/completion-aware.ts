import Anthropic from '@anthropic-ai/sdk';
import { ClientResponseWrapper } from '../client-response-wrapper';

export class CompletionAwareMixin {
  clientReady: Promise<boolean>;

  client: Anthropic;

  public async getChatCompletion(model: string, messages: any[], functions?: any[]): Promise<any> {
    const startTime = Date.now();
    await this.clientReady;
    try {
      const requestObject = {
        max_tokens: 1024,
        model: model,
        messages: messages,
      };
      if (functions) {
        requestObject['functions'] = functions;
      }

      const response = await this.client.messages.create(requestObject);

      if (!response && !response.content && !response.content[0] && !response.content[0].text) {
        throw new Error(`Error response from Anthropic API: ${JSON.stringify(response)}`);
      }

      const endTime = Date.now();
      const responseWrapper = new ClientResponseWrapper(response, endTime - startTime, requestObject);
      return responseWrapper;
    } catch (error) {
      throw new Error(`Error response from Anthropic API: ${error.message}`);
    }
  }
}
