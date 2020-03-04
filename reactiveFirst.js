const reactive = value => {
  let _value = value;
  const data = {};
  const computed = {};

  const result = {
    data,
    computed
  }

  Object.defineProperty(data, 'value', {
    get()  { return _value },
    set(newValue) {
      result._listeners.forEach(callback => callback(_value, newValue));
      _value = newValue;
    },
    enumerable: true
  });

  Object.defineProperties(result, {
    'addWatcher': {
      value(callback) {
        this._listeners.push(callback)

        return result
      },

      enumerable: true
    },

    'createComputedValue': {
      value(name, callback) {
        let _value = callback(data.value)
      
        this._listeners.push((oldValue, newValue) => _value = callback(newValue));
      
        computed[name] = Object.defineProperty({}, 'value', {
          get()  { return _value },
          enumerable: true
        })
      
        return result;
      }
    },
  
    '_listeners': {
      value: [],
      writable: false
    },
  });

  return result;
}

const {
  computed: { add4 },
  data
} = reactive(10)
    .addWatcher((oldvalue, newValue) => console.log(`changed from: ${oldvalue} to ${newValue}`))
    .createComputedValue('add4', value => value + 4);

console.log(reactive(10).createComputedValue('add4', value => value + 4))
console.log(data.value)
console.log(add4.value)
data.value = 0;
console.log(data.value)
console.log(add4.value)

