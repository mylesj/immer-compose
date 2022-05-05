# immer-compose

> _A utility for composing concurrent operations, yet allowing resulting state to be merged in series._

## Install / Prerequisites

[Immer][immer] is a required peer-dependency.

```sh
npm install immer immer-compose
```

## Motivation

I was looking for neat way to merge async updates to an arbitrary document ([JSON Schema][json-schema])
in a sequential order - in my use-case the updates may only be loosely related and I wanted to
separate concerns by expressing them as middleware, _e.g._

```javascript
const pipeline = compose(middlewareOne, middlewareTwo, middleWareThree)
const newState = pipeline(initialState)
```

Yes it's _another_ micro-library... but I found this idea somewhat complex to think through and
felt that it warranted an isolated module - no doubt there'll be alternatives, but I couldn't really
find what I wanted - with immutability in mind (just questions on the immer repo about how to do this).

## Usage

The functions `compose` and `composeWithPatches` are exposed mirroring the _producer_ functions provided
by immer. Note that to use patches, it is required that you import and call from `enablePatches` from
`immer` - this module assumes nothing about which version you are using.

Compose functions accept higher-order functions that can execute any asynchronous task and in turn
return an immer recipe - where each recipe will consume a draft of the previous state in the chain.

```typescript
const higherOrderRecipe = async (initialState) => {
    const data = await task()
    return (draftState) => {
        draftState.foo = 'bar'
    }
}
```

Additionally any other input passed to the composed function will be passed through.

```typescript
const higherOrderRecipe = async (initial, a, b, c) => (draft) => {}
const pipeline = compose(higherOrderRecipe /* [, 0..*] */)
const newState = pipeline(state, 1, 2, 3)
```

## Experimental ⚠️

```typescript
const experimental = async () => async () => {}
```

If a recipe is returned as an async function, the compose function will prioritise the order of
the synchronous recipes before processing the remaining tasks on a first-come first-serve basis.
Effectively allowing middleware to self-determine whether to keep a slot in the queue or go last.

The implementation should be reliable in modern environments but should be considered experimental
as I don't know where I want to take this idea yet and also don't know how much utility it really
has - I'm just playing around.

This behaviour is reliant on `async` functions and won't work with normal functions returning
promises - due to this, it also won't work if you're targeting `es5` through code transpilers
like Babel.

<!-- -->

[immer]: https://immerjs.github.io/immer/
[json-schema]: https://json-schema.org/
