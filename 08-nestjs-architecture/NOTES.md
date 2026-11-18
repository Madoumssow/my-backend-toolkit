# Module 08 : Architecture NestJS (`roles.guard.ts` / `transform.interceptor.ts`)

## Dépendances requises
- `npm install @nestjs/common @nestjs/core reflect-metadata rxjs`

## Comment l'adapter en entreprise
1. **Activer l'intercepteur globalement** dans `main.ts` :
   `app.useGlobalInterceptors(new TransformInterceptor());`
2. **Protéger une route dans un contrôleur** :
   ```ts
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   @Delete(':id')
   remove(@Param('id') id: string) { ... }
   ```

## Pièges à éviter
- **Ordre des Guards** : Toujours placer `JwtAuthGuard` **avant** `RolesGuard` dans `@UseGuards(...)`, car `RolesGuard` a besoin que `request.user` soit déjà rempli.
- **Configuration `tsconfig.json`** : Vérifier que `experimentalDecorators` et `emitDecoratorMetadata` sont à `true`.
