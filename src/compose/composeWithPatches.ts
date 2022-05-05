import { produceWithPatches, Patch } from 'immer'

import {
    AnyArray,
    AnyObject,
    ComposeTask,
    ThunkRecipe,
    ThunkRecipeSync,
    ThunkRecipeAsync,
} from '~/types'

import { isFunction, isAsyncFunction, immutable, watchUpdates } from '~/util'

export const composeWithPatches =
    <State extends AnyObject | AnyArray, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<ThunkRecipe<State>, State, Args>[]
    ) =>
    async (
        state: State,
        ...args: Args[]
    ): Promise<[State, Patch[], Patch[]]> => {
        const recipes = tasks.map((task) => task(immutable(state), ...args))

        let newState = state
        const patches: Patch[] = []
        const reversed: Patch[] = []
        const deferred: ThunkRecipeAsync<State>[] = []
        for (const recipe of recipes) {
            const thunk = await recipe

            if (thunk === undefined || !isFunction(thunk)) {
                continue
            }

            if (isAsyncFunction(thunk)) {
                deferred.push(<ThunkRecipeAsync<State>>thunk)
                continue
            }

            const [next, patch, reverse] = await produceWithPatches(
                newState,
                <ThunkRecipeSync<State>>thunk
            )

            newState = next
            patches.push(...patch)
            reversed.push(...reverse)
        }

        for await (const [next, patch, reverse] of watchUpdates(
            deferred.map((thunk) => produceWithPatches(newState, thunk))
        )) {
            newState = next
            patches.push(...patch)
            reversed.push(...reverse)
        }

        return [newState, patches, reversed]
    }
