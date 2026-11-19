import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.page.html',
  styleUrls: ['./recipe-details.page.scss'],
})
export class RecipeDetailsPage implements OnInit {
  public recipe?: RecipesApiResponse;
  public ingredientOn: boolean = true
  public recipeDetails: RecipesApiResponse [] = [];
  public currentUserUid: string | null = null;
  constructor(private apiService: ApiServiceService, private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUserData().subscribe((userData) => {
      this.currentUserUid = userData?.uid ?? null;
    });
    this.route.params.subscribe((params)=>{
      const recipeid = params['id'];
      this.apiService.getRecipeById(recipeid).subscribe((info )=>{
        this.recipe= info[0];

      })
    })
  }
  public segmentSelect(event:any){
    const selectedSegment = event.detail.value


    if(selectedSegment === "Ingredeintes"){
      this.ingredientOn = true
    }
    else if ( selectedSegment === "Preparacion" ){
      this.ingredientOn = false
    }
  }
  editButton(): void {
  const recipeId = this.route.snapshot.paramMap.get('id');
  if (recipeId) {
    this.router.navigate(['/edit-recipe', recipeId]);
  }
}


}
