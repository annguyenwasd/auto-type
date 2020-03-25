let messages = [];
let i = 0;

// eslint-disable-next-line no-restricted-globals
addEventListener('message', event => {
  const { type, data } = event.data;
  switch (type) {
    case 'messages':
      messages = data;
      break;
    case 'next': {
      const message = messages[i % messages.length];
      i += 1;
      postMessage({
        type: 'next-message',
        data: {
          id: Date.now().toString(),
          ...message
        }
      });
      break;
    }
    case 'stop':
      postMessage({
        type: 'stop'
      });
      break;
    default:
      break;
  }
});
