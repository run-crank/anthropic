import * as grpc from '@grpc/grpc-js';
import { Field } from '../core/base-step';
import { FieldDefinition } from '../proto/cog_pb';
import {
  CompletionAwareMixin,
} from './mixins';
import Anthropic from '@anthropic-ai/sdk';

/**
 * This is a wrapper class around the API client for your Cog. An instance of
 * this class is passed to the constructor of each of your steps, and can be
 * accessed on each step as this.client.
 */
class ClientWrapper {
  /**
   * This is an array of field definitions, each corresponding to a field that
   * your API client requires for authentication. Depending on the underlying
   * system, this could include bearer tokens, basic auth details, endpoints,
   * etc.
   *
   * If your Cog does not require authentication, set this to an empty array.
   */
  public static expectedAuthFields: Field[] = [{
    field: 'AnthropicApiKey',
    type: FieldDefinition.Type.STRING,
    description: 'Anthropic API Key',
    help: 'Anthropic API Key',
  }];

  /**
   * Private instance of the wrapped API client. You will almost certainly want
   * to swap this out for an API client specific to your Cog's needs.
   */
  auth: grpc.Metadata;

  client: Anthropic;

  clientReady: Promise<boolean>;

  /**
   * Constructs an instance of the ClientWwrapper, authenticating the wrapped
   * client in the process.
   *
   * @param auth - An instance of GRPC Metadata for a given RunStep or RunSteps
   *   call. Will be populated with authentication metadata according to the
   *   expectedAuthFields array defined above.
   *
   * @param clientConstructor - An optional parameter Used only as a means to
   *   simplify automated testing. Should default to the class/constructor of
   *   the underlying/wrapped API client.
   */
  constructor(auth: grpc.Metadata, clientConstructor = Anthropic) {
    // Call auth.get() for any field defined in the static expectedAuthFields
    // array here. The argument passed to get() should match the "field" prop
    // declared on the definition object above.
    this.auth = auth;
    this.client = new clientConstructor({
      apiKey: this.auth.get('AnthropicApiKey').toString(), // defaults to process.env["ANTHROPIC_API_KEY"]
    });
    this.clientReady = Promise.resolve(true);
  }
}

interface ClientWrapper extends
  CompletionAwareMixin {}
applyMixins(ClientWrapper, [
  CompletionAwareMixin,
]);

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      // tslint:disable-next-line:max-line-length
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

export { ClientWrapper };
