[![NPM Package Version][shield-npm-version]][npm]
[![GitHub Repository][shield-github]][repo]
[![Changelog][shield-changelog]][releases]
[![GitHub Workflow Status (main)][shield-ci-main]][status-ci-main]
[![Test Coverage][shield-coverage]][codacy-dashboard]

# immer-compose

> _A utility for composing concurrent operations, yet allowing state to be merged in series._

## Install / Prerequisites

[Immer][immer] is a required peer-dependency.

```sh
npm install immer immer-compose
```

## Motivation

I was looking for a neat way to merge async updates to an arbitrary document ([JSON Schema][json-schema])
in a sequential order - in my use-case the updates may only be loosely related and I wanted to
separate concerns by expressing them as middleware, _e.g._

```javascript
const pipeline = compose(middlewareOne, middlewareTwo, middleWareThree)
const newState = pipeline(initialState)
```

Yes it's _another_ micro-library... but I found this idea somewhat complex to think through and
felt that it warranted an isolated module - no doubt there'll be alternatives, but I couldn't find
what I was looking for - with immutability in mind.

## Usage

The functions `compose` and `composeWithPatches` are exposed mirroring the _producer_ functions provided
by immer. Note that to use patches, it is still required that you import `enablePatches` from `immer` -
this module assumes nothing about which version you are using.

Compose functions are higher-order functions that can execute any asynchronous task and in-turn
return an immer recipe - where each recipe will consume a draft of the previous state in the chain.

```typescript
const higherOrderRecipe = async (initialState) => {
    const data = await task()
    return (draftState) => {
        draftState.foo = 'bar'
    }
}
```

Additionally, any other input passed to the composed function will be passed through.

```typescript
const higherOrderRecipe = async (initial, a, b, c) => (draft) => {}
const pipeline = compose(higherOrderRecipe /* [, 0..*] */)
const newState = pipeline(state, 1, 2, 3)
```

## Experimental &nbsp;⚠️

```typescript
const experimental = async () => async () => {}
```

If a recipe is returned as an async function, the compose function will prioritise the order of
the synchronous recipes before processing the remaining tasks on a first-come first-serve basis.
Effectively allowing middleware to self-determine whether to keep a slot in the queue or go last.

The implementation should be reliable in modern environments however, should also be considered
experimental as I don't know where I want to take this idea yet and also don't know how much
utility it really affords - I was just playing around.

This behaviour is reliant on native `async` functions and won't work with regular functions
returning promises - due to this, it also will not work if you are targeting `es5` through
code transpilers like Babel.

<!-- project links -->

[npm]: https://www.npmjs.com/package/immer-compose
[repo]: https://github.com/mylesj/immer-compose
[releases]: https://github.com/mylesj/immer-compose/releases
[status-ci-main]: https://github.com/mylesj/immer-compose/actions/workflows/integration.yml?query=branch%3Amain
[codacy-dashboard]: https://app.codacy.com/gh/mylesj/immer-compose/dashboard?branch=main

<!-- external links -->

[immer]: https://immerjs.github.io/immer/
[json-schema]: https://json-schema.org/

<!-- images -->

[shield-github]: https://img.shields.io/badge/%20-Source-555555?logo=github&style=for-the-badge
[shield-changelog]: https://img.shields.io/badge/%20-Changelog-555555?logo=github&style=for-the-badge
[shield-ci-main]: https://img.shields.io/github/workflow/status/mylesj/immer-compose/CI/main?label=CI&logo=github&style=for-the-badge
[shield-npm-version]: https://img.shields.io/npm/v/immer-compose?&label=%20&logo=npm&style=for-the-badge
[shield-coverage]: https://img.shields.io/codacy/coverage/f2547f2ac77e44f6a6190d813da6c8b9/main?logo=codacy&style=for-the-badge
