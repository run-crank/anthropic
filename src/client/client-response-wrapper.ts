
import { Message } from "@anthropic-ai/sdk/resources";

export class ClientResponseWrapper {
  private originalClass: Message;

  public response_time: number;

  public request_payload: object;

  public text_response: string;

  public usage: object;

  constructor(originalObject: Message, responseTime: number, requestPayload: object) {
    this.originalClass = originalObject;
    this.copyProperties();
    this.response_time = responseTime;
    this.request_payload = requestPayload;
    this.text_response = originalObject.content[0].text;
    this.usage = {
      input: originalObject.usage.input_tokens,
      output: originalObject.usage.output_tokens,
      total: originalObject.usage.input_tokens + originalObject.usage.output_tokens,
    }
  }

  copyProperties() {
    for (const prop in this.originalClass) {
      // Using Object.prototype.hasOwnProperty.call() for safer property check
      if (Object.prototype.hasOwnProperty.call(this.originalClass, prop)) {
        // Use Object.defineProperty to copy property descriptor
        Object.defineProperty(
          this,
          prop,
          Object.getOwnPropertyDescriptor(this.originalClass, prop)!,
        );
      }
    }
  }
}
