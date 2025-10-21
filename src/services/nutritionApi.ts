interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
}

interface OpenFoodFactsProduct {
  product: {
    product_name?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'energy-kcal'?: number;
      'proteins_100g'?: number;
      'carbohydrates_100g'?: number;
      'fat_100g'?: number;
      'fiber_100g'?: number;
      'sugars_100g'?: number;
      'sodium_100g'?: number;
    };
    serving_size?: string;
    quantity?: string;
    brands?: string;
    categories?: string;
  };
  status: number;
}

interface NutritionInfo {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  description: string;
  source: 'usda' | 'openfoodfacts' | 'estimated';
  imageUrl?: string;
  brand?: string;
  fdcId?: number; // For USDA foods to link community photos
  communityImages?: string[]; // Array of user-uploaded image URLs
  allowPhotoUpload?: boolean; // Whether this food accepts community photos
}

class NutritionAPI {
  private readonly USDA_API_KEY = 'DEMO_KEY';
  private readonly USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
  private readonly OPENFOODFACTS_BASE_URL = 'https://world.openfoodfacts.org/api/v0';
  private readonly CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  async searchUSDAFoods(query: string, pageSize: number = 5): Promise<NutritionInfo[]> {
    try {
      console.log('Searching USDA for:', query);
      
      // Try direct API call first
      let url = `${this.USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${this.USDA_API_KEY}`;
      console.log('USDA API URL:', url);
      
      let response: Response;
      
      try {
        response = await fetch(url);
        console.log('Direct USDA Response status:', response.status);
      } catch (corsError) {
        console.log('CORS error with direct call, trying proxy:', corsError);
        // If CORS fails, try with proxy
        const proxiedUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
        console.log('Proxied USDA URL:', proxiedUrl);
        response = await fetch(proxiedUrl);
        console.log('Proxied USDA Response status:', response.status);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('USDA API error response:', errorText);
        throw new Error(`USDA API error: ${response.status} - ${errorText}`);
      }
      
      const data: USDASearchResult = await response.json();
      console.log('USDA API response:', data);
      
      const results = data.foods.map(food => this.parseUSDAFood(food));
      console.log('Parsed USDA results:', results);
      
      return results;
    } catch (error) {
      console.error('Error searching USDA foods:', error);
      return [];
    }
  }

  async getUSDAFoodById(fdcId: number): Promise<NutritionInfo | null> {
    try {
      const response = await fetch(
        `${this.USDA_BASE_URL}/food/${fdcId}?api_key=${this.USDA_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      
      const food: USDAFood = await response.json();
      return this.parseUSDAFood(food);
    } catch (error) {
      console.error('Error fetching USDA food:', error);
      return null;
    }
  }

  async searchByBarcode(barcode: string): Promise<NutritionInfo | null> {
    try {
      const response = await fetch(
        `${this.OPENFOODFACTS_BASE_URL}/product/${barcode}.json`
      );
      
      if (!response.ok) {
        throw new Error(`Open Food Facts API error: ${response.status}`);
      }
      
      const data: OpenFoodFactsProduct = await response.json();
      
      if (data.status === 0 || !data.product) {
        return null;
      }
      
      return this.parseOpenFoodFactsProduct(data.product);
    } catch (error) {
      console.error('Error searching by barcode:', error);
      return null;
    }
  }

  async searchOpenFoodFacts(query: string): Promise<NutritionInfo[]> {
    try {
      console.log('Searching Open Food Facts for:', query);
      const url = `${this.OPENFOODFACTS_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
      console.log('Open Food Facts URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      console.log('Open Food Facts Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Open Food Facts API error response:', errorText);
        throw new Error(`Open Food Facts API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Open Food Facts API response:', data);
      
      if (!data.products) {
        console.log('No products found in Open Food Facts response');
        return [];
      }
      
      const results = data.products
        .filter((product: any) => product.product_name && product.nutriments)
        .map((product: any) => this.parseOpenFoodFactsProduct(product));
      
      console.log('Parsed Open Food Facts results:', results);
      
      return results;
    } catch (error) {
      console.error('Error searching Open Food Facts:', error);
      return [];
    }
  }

  async comprehensiveSearch(query: string): Promise<NutritionInfo[]> {
    console.log('Starting comprehensive search for:', query);
    const results: NutritionInfo[] = [];
    
    try {
      const [usdaResults, openFoodFactsResults] = await Promise.allSettled([
        this.searchUSDAFoods(query, 3),
        this.searchOpenFoodFacts(query)
      ]);
      
      console.log('USDA search result:', usdaResults);
      console.log('Open Food Facts search result:', openFoodFactsResults);
      
      if (usdaResults.status === 'fulfilled') {
        console.log('Adding USDA results:', usdaResults.value.length);
        // Fetch community photos for USDA foods
        const enhancedResults = await Promise.all(
          usdaResults.value.map(async (food) => {
            if (food.fdcId) {
              const communityImages = await this.getCommunityPhotos(food.fdcId);
              return {
                ...food,
                communityImages,
                imageUrl: communityImages.length > 0 ? communityImages[0] : undefined
              };
            }
            return food;
          })
        );
        results.push(...enhancedResults);
      } else {
        console.error('USDA search failed:', usdaResults.reason);
      }
      
      if (openFoodFactsResults.status === 'fulfilled') {
        console.log('Adding Open Food Facts results:', openFoodFactsResults.value.length);
        results.push(...openFoodFactsResults.value);
      } else {
        console.error('Open Food Facts search failed:', openFoodFactsResults.reason);
      }
      
      const finalResults = results.slice(0, 8);
      console.log('Final comprehensive search results:', finalResults);
      
      return finalResults;
    } catch (error) {
      console.error('Error in comprehensive search:', error);
      return [];
    }
  }

  private parseUSDAFood(food: USDAFood): NutritionInfo {
    const nutrients = food.foodNutrients || [];
    
    const getNutrientValue = (nutrientId: number) => {
      const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
      return nutrient ? nutrient.value : undefined;
    };
    
    const calories = getNutrientValue(1008) || 0;
    const protein = getNutrientValue(1003);
    const carbs = getNutrientValue(1005);
    const fat = getNutrientValue(1004);
    const fiber = getNutrientValue(1079);
    const sugar = getNutrientValue(2000);
    const sodium = getNutrientValue(1093);
    
    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium: sodium ? sodium / 1000 : undefined,
      servingSize: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit || 'g'}` : '100g',
      description: food.description,
      source: 'usda',
      fdcId: food.fdcId,
      allowPhotoUpload: true, // USDA foods can accept community photos
      communityImages: [] // Will be populated from backend
    };
  }

  private parseOpenFoodFactsProduct(product: any): NutritionInfo {
    const nutriments = product.nutriments || {};
    
    const calories = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0;
    const protein = nutriments['proteins_100g'];
    const carbs = nutriments['carbohydrates_100g'];
    const fat = nutriments['fat_100g'];
    const fiber = nutriments['fiber_100g'];
    const sugar = nutriments['sugars_100g'];
    const sodium = nutriments['sodium_100g'];
    
    const name = product.product_name || 'Unknown Product';
    const brand = product.brands ? ` (${product.brands})` : '';
    
    // Get product image URL
    const imageUrl = product.image_url || product.image_front_url || product.image_small_url;
    
    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      servingSize: product.serving_size || product.quantity || '100g',
      description: `${name}${brand}`,
      source: 'openfoodfacts',
      imageUrl: imageUrl,
      brand: product.brands
    };
  }

  async uploadCommunityPhoto(fdcId: number, imageFile: File, token: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('fdcId', fdcId.toString());
      
      const response = await fetch('http://localhost:5001/community-photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        console.error('Failed to upload community photo:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error uploading community photo:', error);
      return null;
    }
  }

  async getCommunityPhotos(fdcId: number): Promise<string[]> {
    try {
      const response = await fetch(`http://localhost:5001/community-photos/${fdcId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.images || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching community photos:', error);
      return [];
    }
  }

  estimateCaloriesFromDescription(description: string): NutritionInfo {
    const text = description.toLowerCase();
    let calories = 0;
    
    const foodCalories: { [key: string]: number } = {
      'pizza': 300, 'burger': 500, 'sandwich': 350, 'salad': 150, 'soup': 200,
      'pasta': 400, 'rice': 200, 'chicken': 250, 'beef': 300, 'fish': 200,
      'eggs': 150, 'bread': 100, 'toast': 80, 'cereal': 150, 'oatmeal': 150,
      'coffee': 5, 'tea': 2, 'water': 0, 'juice': 120, 'soda': 150, 'beer': 150,
      'wine': 125, 'milk': 150, 'smoothie': 250, 'protein shake': 200,
      'apple': 80, 'banana': 100, 'orange': 60, 'chips': 150, 'cookies': 100,
      'chocolate': 150, 'nuts': 200, 'yogurt': 100, 'cheese': 100
    };
    
    let multiplier = 1;
    const portionMultipliers: { [key: string]: number } = {
      'small': 0.7, 'medium': 1, 'large': 1.5, 'extra large': 2,
      'slice': 0.3, 'piece': 0.5, 'bowl': 1.2, 'plate': 1.5, 'cup': 0.8
    };
    
    for (const [keyword, mult] of Object.entries(portionMultipliers)) {
      if (text.includes(keyword)) {
        multiplier = mult;
        break;
      }
    }
    
    for (const [food, cals] of Object.entries(foodCalories)) {
      if (text.includes(food)) {
        calories += cals;
      }
    }
    
    calories = Math.round(calories * multiplier);
    
    if (calories === 0) {
      if (text.includes('drink') || text.includes('beverage')) {
        calories = 100;
      } else if (text.includes('snack')) {
        calories = 150;
      } else {
        calories = 300;
      }
    }
    
    return {
      calories,
      description: description,
      source: 'estimated',
      servingSize: 'estimated portion'
    };
  }
}

export const nutritionAPI = new NutritionAPI();
export type { NutritionInfo };