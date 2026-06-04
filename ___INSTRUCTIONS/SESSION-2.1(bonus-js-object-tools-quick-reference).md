# JavaScript Object Bonus Quick Reference

This bonus note explains four core JavaScript patterns used often in form and API code.

## object.assign

Use Object.assign to copy values from one or more source objects into a target object.

```js
const user = { email: 'old@mail.com', password: '1234' }
const defaults = { email: '', password: '' }

Object.assign(user, defaults)

console.log(user)
// { email: '', password: '' }
```

Short use case:
- Reset an existing reactive/form object without replacing its reference.

## Object Destructuring

Use destructuring to pull properties from an object into variables.

```js
const error = {
  message: 'Network error',
  response: null,
}

const { response, message } = error

console.log(response) // null
console.log(message)  // Network error
```

Short use case:
- Read only the fields you need from API responses or error objects.

## Object Spread Operator

Use ... to create a new object by copying properties.

```js
const baseOptions = {
  title: 'Success',
  showConfirmButton: false,
}

const modalOptions = {
  ...baseOptions,
  text: 'Account created successfully.',
}

console.log(modalOptions)
// { title: 'Success', showConfirmButton: false, text: 'Account created successfully.' }
```

Short use case:
- Build option objects by reusing defaults and overriding only what changes.

## Function with Params

Use function parameters to make logic reusable with different inputs.

```js
function showMessage(icon, title, text) {
  return {
    icon,
    title,
    text,
  }
}

const successConfig = showMessage('success', 'Done', 'Saved successfully')
const errorConfig = showMessage('error', 'Error', 'Something went wrong')
```

Short use case:
- Reuse one function for loading, success, and error messages by passing different values.

## Quick Summary

- Object.assign updates an existing target object.
- Destructuring extracts properties into variables.
- Spread creates a new object copy and merges values.
- Function parameters make the same function flexible and reusable.
