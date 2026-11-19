import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./features/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./features/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadChildren: () => import('./core/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'categories',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesPageModule)
  },
  {
    path: 'recipes',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/recipes/recipes.module').then(m => m.RecipesPageModule)
  },
  {
    path: 'form',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/form/form.module').then(m => m.FormPageModule)
  },
  {
    path: 'my-recipes',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/my-recipes/my-recipes.module').then(m => m.MyRecipesPageModule)
  },
  {
    path: 'recipe-details/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/recipe-details/recipe-details.module').then(m => m.RecipeDetailsPageModule)
  },
  {
    path: 'category-details/:category',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/category-details/category-details.module').then(m => m.CategoryDetailsPageModule)
  },
  {
    path: 'search',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'edit-recipe/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/edit-recipe/edit-recipe.module').then(m => m.EditRecipePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
