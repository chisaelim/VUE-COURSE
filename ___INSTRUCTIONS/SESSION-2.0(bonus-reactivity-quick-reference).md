# Vue Reactivity Bonus Quick Reference

This bonus note only covers `ref` and `reactive` with small examples.

## `ref`

Use `ref` for a single reactive value (number, string, boolean, etc.).

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increase() {
  count.value++
}
</script>

<template>
  <button @click="increase">Count: {{ count }}</button>
</template>
```

## `reactive`

Use `reactive` for grouped object state like forms.

```vue
<script setup>
import { reactive } from 'vue'

const user = reactive({
  email: '',
  password: ''
})
</script>

<template>
  <input v-model="user.email" placeholder="Email" />
  <input v-model="user.password" type="password" placeholder="Password" />
</template>
```

## How to Access Values (`.value`)

- In script, `ref` needs `.value` to read/write.
- In script, `reactive` uses normal object property access.
- In template, refs are auto-unwrapped, so you usually do not write `.value`.

```vue
<script setup>
import { ref, reactive } from 'vue'

const count = ref(0)
const user = reactive({ email: '' })

// ref -> use .value in script
count.value = count.value + 1

// reactive -> normal property access
user.email = 'demo@mail.com'
</script>

<template>
  <!-- ref in template: no .value needed -->
  <p>{{ count }}</p>

  <!-- reactive in template: normal property access -->
  <p>{{ user.email }}</p>
</template>
```

## Quick Rule

- Use `ref` for one value.
- Use `reactive` for object/form data.
- In script, `ref` uses `.value`; in template, it usually does not.
