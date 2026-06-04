# Vue Template Bonus Quick Reference

This bonus note lists common Vue template features you can use while building forms and UI interactions.

## Core Bindings and Events

| Syntax | What it does | Short example |
| --- | --- | --- |
| `v-model` | Two-way bind an input value and reactive state. | `<input v-model="user.email" />` |
| `v-model.lazy` | Updates state on `change` (after blur/enter), not every keystroke. | `<input v-model.lazy="profile.name" />` |
| `v-model.trim` | Trims leading/trailing spaces before updating state. | `<input v-model.trim="user.username" />` |
| `v-model.number` | Casts input to number when possible. | `<input type="number" v-model.number="age" />` |
| `:class` | Dynamically add/remove classes from state. | `<input :class="{ 'is-invalid': hasError }" />` |
| `:style` | Dynamically set inline style values. | `<div :style="{ color: textColor }"></div>` |
| `:disabled` | Dynamically disable elements. | `<button :disabled="loading">Save</button>` |
| `:src` | Bind image/media source dynamically. | `<img :src="avatarUrl" />` |
| `:to` | Dynamic route target for RouterLink. | `<RouterLink :to="{ name: 'Dashboard' }" />` |
| `@click` | Run logic when an element is clicked. | `<button @click="submitForm">Submit</button>` |
| `@submit.prevent` | Handle form submit and prevent page reload. | `<form @submit.prevent="signIn">...</form>` |
| `@input` | React to every input value change. | `<input @input="onInput" />` |
| `@change` | React when value is committed (depends on input type). | `<select @change="onRoleChange" />` |
| `@keydown.enter` | Run logic only when Enter is pressed. | `<input @keydown.enter="search" />` |
| `@click.stop` | Stop click event bubbling to parent. | `<button @click.stop="openMenu">Menu</button>` |
| `@submit.prevent.stop` | Combine modifiers: prevent default and stop bubbling. | `<form @submit.prevent.stop="save">...</form>` |

## Conditional and List Rendering

| Syntax | What it does | Short example |
| --- | --- | --- |
| `v-if` | Render only when condition is true. | `<p v-if="error">{{ error }}</p>` |
| `v-else-if` | Alternate branch after `v-if`. | `<p v-else-if="warning">Check input</p>` |
| `v-else` | Final fallback branch. | `<p v-else>All good</p>` |
| `v-show` | Toggle visibility with CSS (`display: none`). | `<div v-show="open">Panel</div>` |
| `v-for` | Repeat element for array/object items. | `<li v-for="item in items" :key="item.id">{{ item.name }}</li>` |

## Text, HTML, and Attribute Helpers

| Syntax | What it does | Short example |
| --- | --- | --- |
| `{{ value }}` | Interpolate reactive text. | `<p>{{ user.name }}</p>` |
| `v-text` | Set text content directly. | `<span v-text="statusLabel"></span>` |
| `v-html` | Render raw HTML string (use carefully). | `<div v-html="trustedHtml"></div>` |
| `v-bind` | Full directive form of `:`. | `<img v-bind:src="coverUrl" />` |

## Useful Form Patterns

### 1) Inline validation class and message

```vue
<input
  v-model="user.email"
  :class="{ 'is-invalid': !!userError.email }"
  type="email"
/>
<div class="invalid-feedback">{{ userError.email }}</div>
```

### 2) Submit once, lock button while loading

```vue
<form @submit.prevent="saveProfile">
  <button type="submit" :disabled="loading">
    {{ loading ? 'Saving...' : 'Save' }}
  </button>
</form>
```

### 3) Click handler with arguments

```vue
<button @click="removeUser(user.id)">Delete</button>
```

## Quick Notes

- Prefer `@submit.prevent` for forms so submit logic stays inside Vue.
- Use `v-model.lazy` when you want fewer updates (for expensive validations).
- Use `v-show` for frequent toggle UI, and `v-if` when you truly need mount/unmount behavior.
- Avoid `v-html` unless content is trusted and sanitized.
