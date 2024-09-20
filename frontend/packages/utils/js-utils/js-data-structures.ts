interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  size(): number;
}

export class StackArray<T> implements IStack<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  push(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Stack has reached max capacity, you cannot add more items');
    }
    this.storage.push(item);
  }

  pop(): T | undefined {
    return this.storage.pop();
  }

  peek(): T | undefined {
    return this.storage[this.size() - 1];
  }

  size(): number {
    return this.storage.length;
  }
}

// this is a utility class to store unique objects in an array
// it uses the id property of the object to determine uniqueness
// it also stores the ids in a set for quick lookups
// you can freely push objects or arrays of objects without worrying about duplicates
export class UniqueObjectArray<T extends { id: string }> {
  // using a set means provinign a list of ids is O(1)
  private internalSet = new Set<string>();

  // using a map internally so removals are O(1)
  private internalMap = new Map<string, T>();

  push(object: T | T[]) {
    if (Array.isArray(object)) {
      object.forEach(o => this.push(o));
      return;
    }

    if (!this.internalSet.has(object.id)) {
      this.internalSet.add(object.id);
      this.internalMap.set(object.id, object);
    }
  }

  remove(object: T) {
    if (this.internalSet.has(object.id)) {
      this.internalSet.delete(object.id);
      this.internalMap.delete(object.id);
    }
  }

  has(object: T | string) {
    if (typeof object === 'string') {
      return this.internalSet.has(object);
    }

    return this.internalSet.has(object.id);
  }

  get(id: string) {
    return this.internalMap.get(id);
  }

  set(id: string, object: T) {
    this.internalMap.set(id, object);
  }

  array() {
    return Array.from(this.internalMap.values());
  }

  ids() {
    return this.internalSet;
  }

  get size() {
    return this.internalSet.size;
  }
}
