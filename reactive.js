'use strict'

const deepClone = valueObj => {
  if (Array.isArray(valueObj)) {
    return Object.seal(valueObj.map(deepClone));
  }

  if (typeof valueObj === 'object') {
    const res = {};

    Object.entries(valueObj).forEach(([key, value]) => {
      res[key] = deepClone(value);
    });

    return Object.seal(res);
  }

  return valueObj;
}

class Reactive {
  #value;

  #listeners = {};

  data = {};

  computed = {};

  mutators = {};

  constructor(valueObj) {
    this.#value = deepClone(valueObj);
  
    Object.entries(valueObj).forEach(([key, value]) => {
      Object.defineProperty(this.data, key, {
        get: () => this.#value[key],
        set: (newValue) => {
          const processed = deepClone(newValue)
          this.#listeners[key] && this.#listeners[key](this.#value[key], processed)

          this.#value[key] = processed;
        },
        enumerable: true,
      });
    });

    Object.seal(this.data)
    Object.freeze(this)
  }

  addWatcher(watcherObj) {
    Object.entries(watcherObj).forEach(([name, callback]) => {
      this.#listeners[name] = callback
    });

    return this
  }

  createComputedValue(computedObj) {
    Object.entries(computedObj).forEach(([name, callback]) => {
      Object.defineProperty(this.computed, name, {
        get: () => Object.seal(callback(this.data)),
        enumerable: true,
      })
    });
  
    return this;
  }

  addMutator(mutator) {
    const {data, computed, mutators} = this;
    Object.entries(mutator).forEach(([name, callback]) => {
      this.mutators[name] = (value) => callback({data, computed, mutators}, value)
    })

    return this;
  }
}


const reactive = new Reactive({ age: 10 , name: 'Tunde', set: { a:1, b:2 }, list: [9, 0, {x: 2, y: 9}] })
.addWatcher({ age: (oldvalue, newValue) => console.log(`changed from: ${oldvalue} to ${newValue}`) })
.addWatcher({ name: (oldvalue, newValue) => console.log(`changed from: ${oldvalue} to ${newValue}`) })
.createComputedValue({ foured: value => value.age + 4 })
.createComputedValue({ numbered: value => value.list.filter(v => typeof v === 'number') })
.addMutator({ increaseAge: ({data}, value) => {data.age += value} })
.addMutator({ changeName: ({data}, value) => {data.name = value} })

const reactive2 = new Reactive({ age: 10 , name: 'Tunde', password: '' })
.addWatcher({ password: (oldvalue, newValue) => reactive.data.name = newValue })

// reactive.data.list[2].wq = 30;
// console.log(reactive.data.list)

// reactive.data.list = reactive.data.list.map((value, index) => {
//   return index === 2 ? {...value, qw: 30} : value;
// });

// console.log(reactive.data.list)
// reactive.data.list[2].qer = 123;
// console.log(reactive.data.list)

// console.log(reactive.computed.foured)
// reactive.mutators.increaseAge(25);
// console.log(reactive.data.age)
// console.log(reactive.computed.foured)

// reactive.computed.numbered.push(4)
// console.log(reactive.computed.numbered)

console.log(reactive.data.name)
console.log(reactive2.data.password)
reactive2.data.password = 'funny'
console.log(reactive.data.name)
console.log(reactive2.data.password)

// reactive.mutators.changeName('segun')
// console.log(reactive.data.name)

