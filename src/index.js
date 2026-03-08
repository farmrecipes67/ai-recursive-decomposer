/**
 * ai-recursive-decomposer
 * Divide-and-conquer task decomposition for complex AI problem solving.
 * @module ai-recursive-decomposer
 */

class AIRecursiveDecomposer {
  constructor(options = {}) {
    this.callAI = options.callAI;
    this.maxDepth = options.maxDepth || 4;
    this.minComplexity = options.minComplexity || 1;
    this.onSubtask = options.onSubtask || null;
    if (!this.callAI) throw new Error('callAI function is required');
  }

  async solve(problem) {
    const result = await this._decompose(problem, 0);
    return result;
  }

  async _decompose(task, depth) {
    const complexity = await this._assessComplexity(task);

    if (depth >= this.maxDepth || complexity <= this.minComplexity) {
      const answer = await this._solveAtomic(task);
      if (this.onSubtask) await this.onSubtask({ task, answer, depth, atomic: true });
      return { task, answer, subtasks: [], depth };
    }

    const subtasks = await this._split(task);
    if (subtasks.length <= 1) {
      const answer = await this._solveAtomic(task);
      return { task, answer, subtasks: [], depth };
    }

    const subtaskResults = await Promise.all(
      subtasks.map(st => this._decompose(st, depth + 1))
    );

    const synthesis = await this._synthesize(task, subtaskResults);
    if (this.onSubtask) await this.onSubtask({ task, answer: synthesis, depth, atomic: false });

    return { task, answer: synthesis, subtasks: subtaskResults, depth };
  }

  async _assessComplexity(task) {
    const raw = await this.callAI(
      'Rate the complexity of this task from 1 (trivial) to 5 (very complex). Return ONLY a number.\n\nTask: ' + task,
      'You assess task complexity.'
    );
    const num = parseInt(raw);
    return isNaN(num) ? 3 : Math.max(1, Math.min(5, num));
  }

  async _split(task) {
    const raw = await this.callAI(
      'Break this task into 2-4 independent subtasks. Return a JSON array of strings.\n\nTask: ' + task,
      'You decompose tasks precisely.'
    );
    try {
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start !== -1 && end > start) return JSON.parse(raw.substring(start, end + 1));
    } catch (e) {}
    return [task];
  }

  async _solveAtomic(task) {
    return this.callAI('Solve this task completely and concisely:\n\n' + task, 'You are a thorough problem solver.');
  }

  async _synthesize(originalTask, subtaskResults) {
    const parts = subtaskResults.map((r, i) => 'Subtask ' + (i + 1) + ': ' + r.task + '\nResult: ' + r.answer).join('\n\n');
    return this.callAI(
      'Original task: ' + originalTask + '\n\nSubtask results:\n' + parts + '\n\nSynthesize a complete answer.',
      'You synthesize subtask results into coherent answers.'
    );
  }
}

module.exports = AIRecursiveDecomposer;