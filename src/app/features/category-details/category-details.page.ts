import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.page.html',
  styleUrls: ['./category-details.page.scss'],
})
export class CategoryDetailsPage implements OnInit {
  recipes: RecipesApiResponse[] = [];
  category: string = '';
  currentUserUid: string | null = null;
  constructor(private apiService: ApiServiceService, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getCurrentUserData().subscribe(userData => {
      this.currentUserUid = userData?.uid || null;
    });
    this.route.paramMap.subscribe(params => {
      this.category = params.get('category') || ''; 
      
      this.loadRecipesByCategory(this.category); 
    });
  }

  loadRecipesByCategory(category: string): void {
    if (!this.currentUserUid) return;
    this.apiService.getRecipe(this.currentUserUid).subscribe(recipes => {
      this.recipes = recipes.filter(recipe => recipe.category === category);
      
    });
  }

  handleRefresh(ev: any) {
    this.loadRecipesByCategory(this.category); 
    setTimeout(() => {
      ev.target.complete();
    }, 1000);
  }
}
