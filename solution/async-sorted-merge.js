"use strict";
const { MinPriorityQueue } = require('@datastructures-js/priority-queue');

module.exports = async (logSources, printer) => {
  const minPQ = new MinPriorityQueue((entry) => entry.logEntry.date);
  
  const initialLogEntries = [];
  logSources.forEach((source, index) => {
    initialLogEntries.push(insertLogEntry(source, index, minPQ));
  })
  // In this case I am using Promise.all to wait for all initial log entries 
  //to be inserted into the Min Priority Queue
  await Promise.all(initialLogEntries);

  while (!minPQ.isEmpty()) {
    const { logEntry, sourceIndex } = minPQ.dequeue();
    printer.print(logEntry);
    if (!logSources[sourceIndex].drained) {
      const nextLogEntry = await logSources[sourceIndex].popAsync();
      if (nextLogEntry) minPQ.enqueue({ logEntry: nextLogEntry, sourceIndex });
    }   
  }

  printer.done();
};

const insertLogEntry = async (source, index, minPQ) => {
  const logEntry = await source.popAsync();
  if (logEntry) minPQ.enqueue({ logEntry, sourceIndex: index });
}

