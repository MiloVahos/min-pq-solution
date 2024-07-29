"use strict";
const { MinPriorityQueue } = require('@datastructures-js/priority-queue');

module.exports = (logSources, printer) => {
  // The Data Structure used here is a Min Priority Queue
  // This data structure allows me to pop the log entry with the earliest date
  // and enqueue the next log entry from the same source in correct spot in the queue
  // This way I can ensure that the log entries are printed in chronological order
  // assuming that the log entries are already sorted in each log source
  const minPQ = new MinPriorityQueue((entry) => entry.logEntry.date);
  
  // Initialize the Min Priority Queue with the first log entry from each log source
  // This can lead to a memory problem if the size of the log sources is very large
  logSources.forEach((source, index) => {
    const logEntry = source.pop();
    if (logEntry) minPQ.enqueue({ logEntry, sourceIndex: index });
  });

  while (!minPQ.isEmpty()) {
    const { logEntry, sourceIndex } = minPQ.dequeue();
    printer.print(logEntry);
    if (!logSources[sourceIndex].drained) {
      const nextLogEntry = logSources[sourceIndex].pop();
      // Last log entry from the source will be undefined
      if (nextLogEntry) minPQ.enqueue({ logEntry: nextLogEntry, sourceIndex });
    }   
  }

  printer.done();
};
