import http from 'http';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let count = 0;
  const interval = setInterval(() => {
    count++;
    if (count <= 5) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: 'thinking...' } }] })}\n\n`);
    } else if (count <= 10) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'hello' } }] })}\n\n`);
    } else {
      res.write('data: [DONE]\n\n');
      res.end();
      clearInterval(interval);
    }
  }, 1000);
});

server.listen(8080, () => console.log('Test server running on port 8080'));
