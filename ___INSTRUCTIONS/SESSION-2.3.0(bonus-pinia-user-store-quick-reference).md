# Pinia User Store Bonus Quick Reference

This bonus note explains the key parts of the `useUserStore` used throughout this course — state, getters, actions, token helpers.

---

## `defineStore`

`defineStore` creates a named store that any component or file can import and use.

```js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
});
```

Short use case:
- Define the store once, import `useUserStore()` anywhere — components, router guards, API helpers.

---

## `state`

`state` is a factory function that returns the initial reactive data for the store.

```js
state: () => ({
  id: null,
  name: null,
  email: null,
  password_null: true,
  level: null,
}),
```

Short use case:
- Access as `userStore.name` in any component without prop drilling.
- `null` fields evaluate as falsy, which makes auth checks like `!!state.id` reliable.

---

## `getters`

Getters are computed properties derived from state. They update automatically when state changes.

```js
getters: {
  isAuthenticated: (state) => !!state.id,
  isAdministrator: (state) => state.level === '_ADMINISTRATOR_',
},
```

Usage in a component:

```js
const userStore = useUserStore();

if (userStore.isAuthenticated) {
  // user is logged in
}
```

Short use case:
- `isAuthenticated` is the single source of truth for whether a user is logged in.
- Route guards read this instead of checking `id` directly.

---

## `actions` — State Management

Actions are methods that read and write store state. Unlike Vuex, they can be `async` and called directly.

```js
actions: {
  setState(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.level = user.level;
    // ...
  },
  resetState() {
    this.id = null;
    this.name = null;
    this.email = null;
    this.level = null;
    // ...
  },
},
```

Short use case:
- Call `userStore.setState(user)` after a successful sign-in or token verify.
- Call `userStore.resetState()` to clear user data without touching the token.

---

## `actions` — Token Helpers

Token helpers wrap `localStorage` so no component writes to storage directly.

```js
actions: {
  setSanctumToken(token) {
    localStorage.setItem('SANCTUM-TOKEN', token);
  },
  getSanctumToken() {
    return localStorage.getItem('SANCTUM-TOKEN');
  },
  removeSanctumToken() {
    localStorage.removeItem('SANCTUM-TOKEN');
  },
},
```

Short use case:
- `setSanctumToken` — called after sign-in to persist the token across page reloads.
- `getSanctumToken` — called in the route guard to retrieve the token for verification.
- `removeSanctumToken` — called on sign-out to invalidate the local session.

---

## `actions` — `reset()`

`reset()` clears both user state and the stored token in one call.

```js
reset() {
  this.resetState();
  this.removeSanctumToken();
},
```

Short use case:
- Use `userStore.reset()` in sign-out and failed token verify flows to ensure no stale data remains.

---

## Action vs Getter — When to Use Which

| Need | Use |
| --- | --- |
| Derived boolean / computed value | Getter |
| Reading or writing state | Action |
| Wrapping `localStorage` | Action |
| Combining multiple state writes | Action |

---

## Quick Summary

- `state` holds the raw user data — `id`, `name`, `email`, `level`, etc.
- `getters` derive boolean flags like `isAuthenticated` from state.
- `setState` / `resetState` hydrate or clear the user profile fields.
- Token helpers keep `localStorage` access centralized and out of components.
- `reset()` is the single call to fully sign out a user locally.
