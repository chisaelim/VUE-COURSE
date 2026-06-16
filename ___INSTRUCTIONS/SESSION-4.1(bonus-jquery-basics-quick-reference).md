# jQuery Basics Bonus Quick Reference

This bonus note covers essential jQuery patterns used in this project: DOM selection, event listeners, CSS class manipulation, and modal control.

---

## What is jQuery?

jQuery is a JavaScript library that simplifies DOM manipulation and event handling. It makes code shorter and cross-browser compatible.

```js
// Vanilla JavaScript (verbose)
document.getElementById('TEST-MODAL').classList.add('highlight')
document.getElementById('TEST-MODAL').style.display = 'block'

// jQuery (concise)
$('#TEST-MODAL').addClass('highlight').show()
```

The `$` function is jQuery's main tool — it selects DOM elements and returns a jQuery object with methods you can chain.

---

## Selectors

jQuery selectors use CSS selector syntax to find elements.

### By ID

```js
$('#TEST-MODAL')  // Selects element with id="TEST-MODAL"
```

### By Class

```js
$('.form-control')  // Selects all elements with class="form-control"
```

### By Tag Name

```js
$('button')  // Selects all <button> elements
$('input')   // Selects all <input> elements
```

### Combination

```js
$('.modal button')       // All <button> inside elements with class="modal"
$('form input.active')   // All <input> with class="active" inside <form>
$('[data-id="5"]')      // All elements with data-id="5"
```

---

## Modal Control

Bootstrap modals are JavaScript objects controlled via jQuery.

### Show Modal

```js
$('#TEST-MODAL').modal('show')
```

Opens the modal with fade animation. The modal becomes visible and takes focus.

### Hide Modal

```js
$('#TEST-MODAL').modal('hide')
```

Closes the modal with fade animation. The modal disappears and focus returns to the page.

### Example in Test.vue

```js
function showModal() {
  $('#TEST-MODAL').modal('show')
}

function hideModal() {
  $('#TEST-MODAL').modal('hide')
}
```

---

## Event Listeners

Use `.on()` to listen for DOM events.

### Modal Events

```js
$('#TEST-MODAL').on('show.bs.modal', function () {
  console.log('Modal is about to show')
})

$('#TEST-MODAL').on('shown.bs.modal', function () {
  console.log('Modal finished showing')
})

$('#TEST-MODAL').on('hide.bs.modal', function () {
  console.log('Modal is about to hide')
})

$('#TEST-MODAL').on('hidden.bs.modal', function () {
  console.log('Modal finished hiding')
})
```

**Key difference:**
- `show.bs.modal` — **before** animation starts
- `shown.bs.modal` — **after** animation completes (modal visible)
- `hide.bs.modal` — **before** animation starts  
- `hidden.bs.modal` — **after** animation completes (modal gone)

### Example: Reset Form When Modal Closes

```js
onMounted(async () => {
  $('#TEST-MODAL').on('hide.bs.modal', function () {
    resetAllState()  // Clear form inputs and errors
  })
})
```

This listener fires when the modal closes (any way — user clicks Cancel, Save, or X button). Perfect place to reset form state for a fresh modal next time.

### Click Events

```js
$('button').on('click', function () {
  console.log('Button clicked')
})

$('#TEST-MODAL').on('click', '.btn-primary', function () {
  console.log('Primary button inside modal clicked')
})
```

**Key point:** The second example uses **event delegation**. Instead of listening to individual buttons, you listen to the modal and filter for clicks on `.btn-primary`. This works even for buttons added dynamically later.

---

## CSS Class Manipulation

### Add Class

```js
$('#TEST-MODAL').addClass('highlight')
// <div id="TEST-MODAL" class="modal highlight">
```

### Remove Class

```js
$('#TEST-MODAL').removeClass('highlight')
// <div id="TEST-MODAL" class="modal">
```

### Toggle Class

```js
$('#TEST-MODAL').toggleClass('highlight')
// Adds class if not present, removes if present
```

### Has Class (Check)

```js
if ($('#TEST-MODAL').hasClass('highlight')) {
  console.log('Modal has highlight class')
}
```

### Replace Class

```js
$('#TEST-MODAL').removeClass('alert-danger').addClass('alert-success')
// Or chained
$('#TEST-MODAL').switchClass('alert-danger', 'alert-success')
```

---

## DOM Content Manipulation

### Get/Set Text

```js
// Get text
const text = $('#TEST-MODAL h5').text()  // Returns inner text

// Set text
$('#TEST-MODAL h5').text('New Title')
```

### Get/Set HTML

```js
// Get HTML (includes tags)
const html = $('#TEST-MODAL').html()

// Set HTML
$('#TEST-MODAL').html('<p>Hello</p>')
```

### Get/Set Form Values

```js
// Get input value
const email = $('input[name="email"]').val()

// Set input value
$('input[name="email"]').val('user@example.com')

// Clear input
$('input[name="email"]').val('')
```

---

## Show/Hide Elements

### Hide

```js
$('#TEST-MODAL').hide()  // CSS: display: none
```

### Show

```js
$('#TEST-MODAL').show()  // CSS: display: block (or inline, etc.)
```

### Toggle

```js
$('#TEST-MODAL').toggle()  // Hide if visible, show if hidden
```

---

## Attribute Manipulation

### Get Attribute

```js
const id = $('input').attr('id')
const type = $('input').attr('type')
```

### Set Attribute

```js
$('input').attr('disabled', true)
$('button').attr('title', 'Click to save')
```

### Remove Attribute

```js
$('input').removeAttr('disabled')
```

### Data Attributes

```js
// HTML: <button data-id="5" data-action="edit">Edit</button>

// Get data
const id = $('button').data('id')        // "5"
const action = $('button').data('action') // "edit"

// Set data
$('button').data('id', 10)
```

---

## Common Patterns in This Project

### Pattern 1: Modal Toggle

```js
function showModal() {
  $('#TEST-MODAL').modal('show')
}

function hideModal() {
  $('#TEST-MODAL').modal('hide')
}

// Usage
$('#add-btn').on('click', showModal)
```

### Pattern 2: Form Reset on Modal Close

```js
onMounted(async () => {
  $('#TEST-MODAL').on('hide.bs.modal', function () {
    Object.assign(testObj, defaultTestObj)      // Clear form data
    Object.assign(testErrObj, defaultTestErrObj) // Clear errors
  })
})
```

### Pattern 3: Event Delegation for Dynamic Content

```js
// Listen for clicks on buttons inside a container
$('#test-table').on('click', '.btn-delete', function () {
  const testId = $(this).data('id')
  removeTest(testId)
})

// HTML (can be added/removed without rebinding)
// <table id="test-table">
//   <tr data-id="1">
//     <td><button class="btn-delete" data-id="1">Delete</button></td>
//   </tr>
// </table>
```

### Pattern 4: Check if Element Exists

```js
if ($('#TEST-MODAL').length > 0) {
  console.log('Modal exists')
} else {
  console.log('Modal does not exist')
}

// Or shorter
if ($('#TEST-MODAL').length) {
  // Element exists
}
```

---

## Chaining

jQuery methods return the jQuery object, so you can chain multiple methods.

```js
$('#TEST-MODAL')
  .addClass('active')
  .fadeIn(300)
  .find('input')
  .focus()
```

This:
1. Adds class "active" to modal
2. Fades in over 300ms
3. Finds the first `<input>` inside
4. Focuses on it (cursor appears in input)

---

## Common Mistakes

### ❌ Mistake 1: Not wrapping jQuery selectors

```js
// ❌ Won't work — vanilla JS, not jQuery
.modal('show')  // Error: .modal is not a function

// ✅ Correct
$('#TEST-MODAL').modal('show')  // jQuery object has .modal method
```

### ❌ Mistake 2: Using vanilla JS instead of jQuery

```js
// ❌ Mixing: jQuery and vanilla JS don't mix well
const modal = document.getElementById('TEST-MODAL')
modal.addClass('highlight')  // Error: vanilla element has no .addClass

// ✅ Stay with jQuery
const modal = $('#TEST-MODAL')
modal.addClass('highlight')
```

### ❌ Mistake 3: Forgetting to import jQuery

```js
// ❌ Error: $ is not defined
$('#TEST-MODAL').modal('show')

// ✅ Import at top of component
import $ from 'jquery'
$('#TEST-MODAL').modal('show')
```

### ❌ Mistake 4: Binding to elements that don't exist yet

```js
// ❌ Event listener doesn't work for future elements
$('button').on('click', doSomething)

// ✅ Use event delegation on a parent that always exists
$('#test-table').on('click', 'button', doSomething)
```

---

## Quick Reference Table

| Method | Purpose | Example |
|--------|---------|---------|
| `$(selector)` | Select elements | `$('#modal')`, `$('.btn')` |
| `.modal('show')` | Show Bootstrap modal | `$('#modal').modal('show')` |
| `.modal('hide')` | Hide Bootstrap modal | `$('#modal').modal('hide')` |
| `.on(event, fn)` | Listen for event | `$('#btn').on('click', handler)` |
| `.addClass(class)` | Add CSS class | `$('#div').addClass('active')` |
| `.removeClass(class)` | Remove CSS class | `$('#div').removeClass('active')` |
| `.toggleClass(class)` | Add/remove class | `$('#div').toggleClass('active')` |
| `.hasClass(class)` | Check class exists | `$('#div').hasClass('active')` |
| `.val()` | Get/set input value | `$('input').val()` or `.val('text')` |
| `.text()` | Get/set text content | `$('span').text()` or `.text('text')` |
| `.html()` | Get/set HTML content | `$('#div').html()` or `.html('<p>hi</p>')` |
| `.show()` | Show element | `$('#div').show()` |
| `.hide()` | Hide element | `$('#div').hide()` |
| `.attr(name)` | Get attribute | `$('input').attr('id')` |
| `.attr(name, val)` | Set attribute | `$('input').attr('disabled', true)` |
| `.data(key)` | Get data attribute | `$('btn').data('id')` |
| `.data(key, val)` | Set data attribute | `$('btn').data('id', 5)` |
| `.find(selector)` | Find children | `$('#form').find('input')` |
| `.length` | Count matched elements | `$('#modal').length` |

---

## When to Use jQuery vs Vue

| Task | Use | Why |
|------|-----|-----|
| Show/hide Bootstrap modal | jQuery | Bootstrap modals require jQuery/JS API |
| Toggle CSS class on state | Vue | Use `:class` binding — reactive |
| Listen for user input in form | Vue | Use `v-model` — two-way binding |
| Listen for Bootstrap events | jQuery | `hide.bs.modal`, `shown.bs.modal`, etc. |
| Access form value in script | Vue | Use reactive object — no DOM querying |
| Validate form on submit | Vue | Use reactive data and error objects |
| Click outside modal to close | jQuery | Use Bootstrap's `data-backdrop` attribute |

---

## Summary

- **jQuery `$()` selects DOM elements** — like CSS selectors.
- **Methods operate on selection** — `.modal('show')`, `.addClass()`, `.on()`.
- **Bootstrap modals use jQuery** — required for `.modal()` API.
- **Event listeners use `.on()`** — works with Bootstrap events like `hide.bs.modal`.
- **Combine with Vue reactivity** — jQuery for DOM/modal control, Vue for state/binding.
- **Keep Vue for forms, jQuery for modals** — each tool excels at its domain.
