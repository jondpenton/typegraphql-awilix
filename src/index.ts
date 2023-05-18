import 'reflect-metadata'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSchema, ResolverData } from 'type-graphql'
import { Awilix } from './lib/awilix'
import { Logger } from './logger'
import { RecipeResolver } from './recipe/recipe.resolver'
import { sampleRecipes } from './recipe/recipe.samples'
import { RecipeService } from './recipe/recipe.service'
import { Context, Cradle } from './types'

const container = Awilix.createContainer<
  Pick<Cradle, 'logger' | 'recipeService' | 'sampleRecipes'>
>().register({
  logger: Awilix.asClass(Logger),
  recipeService: Awilix.asClass(RecipeService).classic(),
  sampleRecipes: Awilix.asValue(sampleRecipes),
})

async function main() {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver],
    // register our custom, scoped IOC container by passing a extracting from resolver data function
    container: ({ context }: ResolverData<Context>) => ({
      get(someClass, _resolverData) {
        // Alternatively, you could register the resolvers in the container
        // (like `.register({ RecipeResolver: Awilix.asClass(RecipeResolver).classic() })`)
        // and do `context.container.resolve(someClass.name)`
        return context.container.build(someClass)
      },
    }),
  })

  // create GraphQL server
  const server = new ApolloServer<Context>({
    // create a plugin that will allow for disposing the scoped container created for every request
    plugins: [
      {
        requestDidStart: async () => ({
          async willSendResponse(requestContext) {
            // remember to dispose the scoped container to prevent memory leaks
            await requestContext.contextValue.container.dispose()
          },
        }),
      },
    ],
    schema,
  })

  // start the server
  const { url } = await startStandaloneServer(server, {
    // we need to provide unique container with `requestId` for each request
    context: async () => {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) // uuid-like
      const context = {
        container: container.createScope<Pick<Cradle, 'requestId'>>().register({
          requestId: Awilix.asValue(requestId),
        }),
      }

      return context
    },
    listen: { port: 4000 },
  })
  console.log(`Server is running, GraphQL Playground available at ${url}`)
}

main()
