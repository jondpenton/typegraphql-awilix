import * as Awilix from 'awilix'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Logger } from '../logger'
import { Cradle } from '../types'
import { RecipeInput } from './recipe.input'
import { RecipeService } from './recipe.service'
import { Recipe } from './recipe.type'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// this resolver will be recreated for each request (scoped)
@Resolver(() => Recipe)
export class RecipeResolver {
  // not needed if registered in container with `.classic()`
  static readonly [Awilix.RESOLVER] = {
    injectionMode: Awilix.InjectionMode.CLASSIC,
  }

  constructor(
    private readonly recipeService: RecipeService,
    private readonly logger: Logger,
  ) {
    console.log('RecipeResolver created!')
  }

  @Query(() => Recipe, { nullable: true })
  async recipe(
    @Arg('recipeId', () => String) recipeId: string,
    @Ctx() { requestId }: Cradle,
  ) {
    const recipe = await this.recipeService.getOne(recipeId)
    if (!recipe) {
      console.log('request ID:', requestId) // the same requestId that logger has
      this.logger.log(`Recipe ${recipeId} not found!`)
    }
    return recipe
  }

  @Query(() => [Recipe])
  async recipes(): Promise<Recipe[]> {
    await delay(5000) // simulate delay to allow for manual concurrent requests
    return this.recipeService.getAll()
  }

  @Mutation(() => Recipe)
  async addRecipe(
    @Arg('recipe', () => RecipeInput) recipe: RecipeInput,
  ): Promise<Recipe> {
    return this.recipeService.add(recipe)
  }
}
