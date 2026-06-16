# Vue 3 Lifecycle Hooks Bonus Quick Reference

This bonus note covers the most commonly used lifecycle hooks in Vue 3 Composition API with practical examples.

---

## The Lifecycle Timeline

Every component goes through these phases in order:

```
Create → Mount → Update → Unmount
  ↓        ↓       ↓        ↓
Before → After  Before → After
```

---

## onBeforeMount

Fires **before** the component renders to the DOM. Rarely used.

```vue
<script setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  console.log('Component about to mount - DOM not created yet')
})
</script>
```

**Use case:** Almost never — `onMounted` is more useful.

---

## onMounted

Fires **after** the component is rendered to the DOM and is interactive. Most commonly used.

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { apiGetTestsWithDetails } from '@/functions/api/test'

const tests = ref([])

onMounted(async () => {
  try {
    const response = await apiGetTestsWithDetails()
    tests.value = response.data.tests
  } catch (error) {
    console.error('Failed to load tests:', error)
  }
})
</script>
```

**Use case:**
- Fetch data from an API (like in Test.vue).
- Initialize third-party libraries (jQuery plugins, charts, maps).
- Set focus on an input field.
- Anything that needs the DOM to exist first.

---

## onUpdated

Fires **after** reactive data changes and the component re-renders. Runs every time.

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const count = ref(0)

onUpdated(() => {
  console.log('Component re-rendered. Count is now:', count.value)
})
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

**Use case:**
- Log when state changes (debugging).
- Sync DOM side-effects after a data update.
- **Caution:** Can run many times — avoid heavy logic here.

---

## onBeforeUpdate

Fires **before** re-render happens. Rarely used.

```vue
<script setup>
import { onBeforeUpdate } from 'vue'

onBeforeUpdate(() => {
  console.log('About to re-render - old DOM still in place')
})
</script>
```

**Use case:** Almost never — typically use `onUpdated` instead.

---

## onUnmounted

Fires **after** the component is removed from the DOM. Important for cleanup.

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('Component mounted')
  
  // Start an interval
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)
  
  // Clean up when component unmounts
  onUnmounted(() => {
    clearInterval(timer)
    console.log('Cleaned up timer')
  })
})
</script>
```

**Use case:**
- Clear timers (`clearInterval`, `clearTimeout`).
- Remove event listeners.
- Cancel pending API requests.
- Free up memory to prevent memory leaks.

---

## onBeforeUnmount

Fires **before** the component is removed. Rarely used separately from `onUnmounted`.

```vue
<script setup>
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  console.log('Component about to unmount - still in DOM')
})
</script>
```

**Use case:** Almost never — typically use `onUnmounted` instead.

---

## Multiple Lifecycle Hooks in One Component

You can use multiple hooks. They fire in order:

```vue
<script setup>
import { ref, onBeforeMount, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)

onBeforeMount(() => console.log('1. Before mount'))
onMounted(() => console.log('2. Mounted'))
onUpdated(() => console.log('3. Updated'))
onUnmounted(() => console.log('4. Unmounted'))
</script>

<template>
  <button @click="count++">Click {{ count }}</button>
</template>
```

**Output when clicking button:**
```
1. Before mount (once on page load)
2. Mounted (once on page load)
3. Updated (every time you click)
```

---

## Lifecycle + Error Handling Pattern

Common pattern used in Session 4.0 (Test.vue):

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { LoadingModal, CloseModal, MessageModal } from '@/functions/swal'

const data = ref([])

onMounted(async () => {
  try {
    LoadingModal()               // Show loading
    await fetchData()            // Fetch from API
    CloseModal()                 // Hide loading
  } catch (error) {
    MessageModal({               // Show error
      icon: 'error',
      title: 'Error',
      text: error.message
    })
  }
})

async function fetchData() {
  const response = await api.getData()
  data.value = response.data
}
</script>
```

**Pattern:**
1. `onMounted` fires.
2. Show loading spinner.
3. Await async API call.
4. If success: close spinner, render data.
5. If error: show error modal.

---

## Common Mistakes

### ❌ Mistake 1: Forgetting cleanup in onUnmounted

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Memory leak! Timer never stops when component unmounts
  setInterval(() => {
    console.log('Tick')
  }, 1000)
})
</script>
```

### ✅ Fix: Clean up in onUnmounted

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let timer

onMounted(() => {
  timer = setInterval(() => {
    console.log('Tick')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)  // Stop the timer
})
</script>
```

---

### ❌ Mistake 2: Heavy logic in onUpdated

```vue
<script setup>
import { ref, onUpdated } from 'vue'

const count = ref(0)

onUpdated(() => {
  // This runs EVERY render — avoid expensive operations!
  for (let i = 0; i < 1000000; i++) {
    Math.sqrt(i)
  }
})
</script>
```

### ✅ Fix: Move to a computed or watcher

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// Runs only when count changes, not on every render
const expensive = computed(() => {
  let sum = 0
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sqrt(i)
  }
  return sum
})
</script>
```

---

## Quick Decision Tree

| Need to... | Use |
|---|---|
| Fetch data when page loads | `onMounted` |
| Clean up timers/listeners | `onUnmounted` |
| React to state changes | `watch` (not a hook — separate pattern) |
| Compute a value from state | `computed` (not a hook — separate pattern) |
| Log/debug on every render | `onUpdated` |
| Stop something before page disappears | `onUnmounted` |

---

## All Lifecycle Hooks (Reference)

For completeness, here are all available hooks (though most aren't used daily):

| Hook | When it fires |
|---|---|
| `onBeforeMount` | Before first render |
| `onMounted` | After first render ✓ Most common |
| `onBeforeUpdate` | Before re-render |
| `onUpdated` | After re-render ✓ Common |
| `onBeforeUnmount` | Before component removed |
| `onUnmounted` | After component removed ✓ Important |
| `onActivated` | Activated (KeepAlive) |
| `onDeactivated` | Deactivated (KeepAlive) |
| `onErrorCaptured` | Child error caught |
| `onRenderTracked` | Render dependency tracked (dev only) |
| `onRenderTriggered` | Render re-triggered (dev only) |

---

## Summary

- **`onMounted`** → Fetch data, initialize, run once when component appears.
- **`onUpdated`** → React to state changes, debug, but keep it light.
- **`onUnmounted`** → Clean up timers, listeners, prevent memory leaks.
- **All others** → Rarely needed in typical Vue applications.
