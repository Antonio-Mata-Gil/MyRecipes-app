import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, map } from 'rxjs';
import { RecipesApiResponse } from './recipes.models';
import { Firestore, collectionData } from '@angular/fire/firestore';
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  constructor(
    private firestore: Firestore,
  ) {}

  public getCategories(): Observable<RecipesApiResponse[]> {
    const categoryRef = collection(this.firestore, 'Categorias');
    return collectionData(categoryRef, { idField: 'id' }) as Observable<
      RecipesApiResponse[]
    >;
  }

  public getPublicRecipes(): Observable<RecipesApiResponse[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    const publicQuery = query(recipesRef, where('isPublic', '==', true));
    return collectionData(publicQuery, { idField: 'id' }) as Observable<
      RecipesApiResponse[]
    >;
  }

  public getUserRecipes(uid: string): Observable<RecipesApiResponse[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    const privateQuery = query(recipesRef, where('uid', '==', uid));
    return collectionData(privateQuery, { idField: 'id' }) as Observable<
      RecipesApiResponse[]
    >;
  }

  public addReceipes(recipe: RecipesApiResponse) {
    const recipeRef = collection(this.firestore, 'recipes');
    return addDoc(recipeRef, recipe);
  }

public getRecipe(uid: string): Observable<RecipesApiResponse[]> {
  return combineLatest([this.getPublicRecipes(), this.getUserRecipes(uid)]).pipe(
    map(([publicRecipes, userRecipes]) => {
      const combined = [...publicRecipes, ...userRecipes];
      const uniqueMap = new Map<string, RecipesApiResponse>();
      combined.forEach(recipe => uniqueMap.set(recipe.id!, recipe));
      return Array.from(uniqueMap.values());
    })
  );
}

  public getRecipeById(id: string): Observable<RecipesApiResponse[]> {
    const recipeRef = collection(this.firestore, 'recipes');
    const documentRef: DocumentReference<DocumentData> = doc(recipeRef, id);
    return from(getDoc(documentRef)).pipe(
      map((snapshot: DocumentSnapshot<DocumentData>) => {
        const data = snapshot.data() as RecipesApiResponse;
        return [data];
      })
    );
  }

  public editRecipes(recipeId: string, recipe: Partial<RecipesApiResponse>) {
    const recipeDocRef = doc(this.firestore, 'recipes', recipeId);
    return setDoc(recipeDocRef, recipe, { merge: true });
  }

  public deleteRecipeById(id: string) {
    const recipeId = doc(this.firestore, `recipes/${id}`);
    return deleteDoc(recipeId);
  }
}
