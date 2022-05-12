import { RecipeInput } from './recipe.input'
import { Recipe } from './recipe.type'

export class RecipeService {
  private autoIncrementValue: number

  constructor(private readonly sampleRecipes: Recipe[]) {
    console.log('RecipeService created!')
    this.autoIncrementValue = sampleRecipes.length
  }

  async getAll() {
    return this.sampleRecipes
  }

  async getOne(id: string) {
    return this.sampleRecipes.find(it => it.id === id)
  }

  async add(data: RecipeInput) {
    const recipe = this.createRecipe(data)
    this.sampleRecipes.push(recipe)
    return recipe
  }

  private createRecipe(recipeData: Partial<Recipe>): Recipe {
    const recipe = Object.assign(new Recipe(), {
      ...recipeData,
      id: this.getId(),
    })
    return recipe
  }

  private getId(): string {
    return (++this.autoIncrementValue).toString()
  }
}
