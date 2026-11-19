import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-categories-son',
  templateUrl: './categories-son.component.html',
  styleUrls: ['./categories-son.component.scss'],
})
export class CategoriesSonComponent  implements OnInit {


  public ApiCategories?: CategoriesApiResponse[] = [];
  
  constructor(private router: Router, private recipesApi: ApiServiceService, private authService: AuthService) { }

  ngOnInit(): void {
    this.getCategoriesList();
  }

    public getCategoriesList() {
    this.recipesApi.getCategories().subscribe(categories => {
      this.ApiCategories = categories;
    });
  }

  goToCategories(category: CategoriesApiResponse) {
    this.router.navigate(['/tabs/categories/category-details', category.category]);
    
  }
}
