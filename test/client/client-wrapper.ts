import * as chai from 'chai';
import { default as sinon } from 'ts-sinon';
import * as sinonChai from 'sinon-chai';
import 'mocha';

import { ClientWrapper } from '../../src/client/client-wrapper';
import { Metadata } from '@grpc/grpc-js';

chai.use(sinonChai);
chai.use(require('chai-as-promised'));

describe('ClientWrapper', () => {
  const expect = chai.expect;
  let metadata: Metadata;
  let clientWrapperUnderTest: ClientWrapper;
  let anthropicClientStub: any;
  let anthropicConstructorStub: any;

  beforeEach(() => {
    anthropicClientStub = {
      apiKey: sinon.spy(),
    };
    anthropicConstructorStub = sinon.stub();
    anthropicConstructorStub.returns(anthropicClientStub);
  });

  it('authenticates with api key', () => {
    // Construct grpc metadata and assert the client was authenticated.
    const expectedCallArgs = { apiKey: 'Some API key' };
    metadata = new Metadata();
    metadata.add('apiKey', expectedCallArgs.apiKey);

    // Assert that the underlying API client was authenticated correctly.
    clientWrapperUnderTest = new ClientWrapper(metadata, anthropicConstructorStub);
    expect(anthropicConstructorStub).to.have.been.calledWith(expectedCallArgs);
    expect(clientWrapperUnderTest.clientReady).to.eventually.equal(true);
  });

  describe('CompletionAware', () => {
    beforeEach(() => {
      anthropicClientStub = {
        chat: {
          completions: {
            create: sinon.stub(),
          },
        },
      };
      anthropicClientStub.chat.completions.create.returns(Promise.resolve());
      anthropicClientStub.chat.completions.create.then = sinon.stub();
      anthropicClientStub.chat.completions.create.then.resolves();
      anthropicConstructorStub.returns(anthropicClientStub);
    });

    it('getChatCompletion', async () => {
      clientWrapperUnderTest = new ClientWrapper(metadata, anthropicConstructorStub);
      const sampleModel = 'claude-3-haiku-20240307';
      const sampleMessages = [{ 'role': 'user', 'content': 'What\'s the weather like in Boston?' }];
      anthropicClientStub.chat.completions.create.resolves({
        choices: [
          {
            message: 'Some message',
          },
        ],
      });
      await clientWrapperUnderTest.getChatCompletion(sampleModel, sampleMessages);
      expect(anthropicClientStub.chat.completions.create).to.have.been.calledWith({ model: sampleModel, messages: sampleMessages });
    });
  });

});
