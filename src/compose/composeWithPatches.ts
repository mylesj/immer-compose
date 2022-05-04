import { produceWithPatches, Patch } from 'immer'

import { AnyArray, ComposeTask, ComposeWithPatchesRecipe } from '~/types'
import { isFunction } from '~/util'

export const composeWithPatches =
    <State, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<ComposeWithPatchesRecipe<State>, State, Args>[]
    ) =>
    async (
        state: State,
        ...args: Args[]
    ): Promise<[State, Patch[], Patch[]]> => {
        const recipes = await Promise.all(
            tasks.map((task) => task(state, ...args))
        )

        let newState = state
        const patches: Patch[] = []
        const reversed: Patch[] = []
        for (const recipe of recipes) {
            if (recipe === undefined || !isFunction(recipe)) {
                continue
            }

            const [next, patch, reverse] = await produceWithPatches(
                newState,
                recipe
            )
            newState = next
            patches.push(...patch)
            reversed.push(...reverse)
        }

        return [newState, patches, reversed]
    }
