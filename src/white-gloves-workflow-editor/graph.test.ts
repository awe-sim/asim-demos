import { describe, test } from 'vitest';
import { Graph } from './graph';
import { ProcessConnection } from './types';

describe('graph', () => {
  test('should work', () => {
    const g = new Graph(
      ['a', 'b', 'c', 'd'],
      [
        { id: '1a', type: ProcessConnection.AS2, from: 'a', to: 'b' },
        { id: '1a', type: ProcessConnection.SFTP_EXTERNAL, from: 'a', to: 'b' },
        { id: '2b', type: ProcessConnection.AS2, from: 'b', to: 'c' },
        { id: '2b', type: ProcessConnection.HTTP, from: 'b', to: 'c' },
        { id: '2c', type: ProcessConnection.AS2, from: 'b', to: 'd' },
      ],
      ['a'],
      ['c'],
    );
    console.log(g.connectionsUsed);
    g.connectionsUsed.forEach(connection => {
      console.log(connection, g.hasPathsFromStartToEnd(connection), g.hasDeadEnds(connection));
    });
  });
});
