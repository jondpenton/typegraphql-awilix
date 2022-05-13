# TypeGraphQL with Awilix DI Container

```typescript
const container = Awilix.createContainer().register({
  logger: Awilix.asClass(Logger),
  recipeService: Awilix.asClass(RecipeService).classic(),
  sampleRecipes: Awilix.asValue(sampleRecipes),
})

// build TypeGraphQL executable schema
const schema = await buildSchema({
  resolvers: [RecipeResolver],

  // register our custom scoped IOC container
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
const server = new ApolloServer({
  schema,

  // we need to provide unique container with `requestId` for each request
  context: (): Context => {
    const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) // uuid-like
    const context = {
      container: container.createScope().register({
        requestId: Awilix.asValue(requestId),
      }),
    }

    return context
  },

  // create a plugin that will allow for disposing the scoped container created for every request
  plugins: [
    {
      requestDidStart: async () => ({
        async willSendResponse(requestContext) {
          // remember to dispose the scoped container to prevent memory leaks
          await requestContext.context.container.dispose()
        },
      }),
    },
  ] as ApolloServerPlugin<Context>[],
})

// start the server
await server.listen(4000)
```
