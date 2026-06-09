# JavaScript Function, Async/Await, and Export Bonus Quick Reference

This bonus note explains three core JavaScript ideas you use often in Vue projects.

## Function

A function is a reusable block of code that runs when you call it.

```js
function greet(name) {
  return `Hello, ${name}`
}

const message = greet('Chisae')
console.log(message) // Hello, Chisae
```

Short use case:
- Use functions to avoid repeating the same logic in multiple places.

## Async/Await

Use async/await to write asynchronous code in a clean, readable way.

```js
async function loadUser() {
  try {
    const response = await fetch('https://example.com/api/user')
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.log(error.message)
  }
}
```

Short use case:
- Handle API calls step by step without deep .then() chains.

## Export

Use export to share functions or values from one file to another.

### Named export

```js
// math.js
export function add(a, b) {
  return a + b
}
```

```js
// app.js
import { add } from './math.js'
console.log(add(2, 3)) // 5
```

### Default export

```js
// api.js
export default function request(url) {
  return fetch(url)
}
```

```js
// app.js
import request from './api.js'
request('/users')
```

Short use case:
- Keep utility logic in separate files and import only what you need.

## Quick Summary

- Function: reusable logic block.
- Async/await: cleaner asynchronous flow.
- Export/import: share code between files.
