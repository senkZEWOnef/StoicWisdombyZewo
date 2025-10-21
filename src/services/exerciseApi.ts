interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'stretching' | 'powerlifting' | 'strongman' | 'plyometrics';
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  force?: 'push' | 'pull' | 'static';
  mechanic?: 'compound' | 'isolation';
  instructions: string[];
  images?: string[];
  source: 'free-exercise-db' | 'api-ninjas' | 'exercisedb' | 'estimated';
  type?: string;
}

interface WorkoutInfo {
  exercise: Exercise;
  sets: number;
  reps?: number;
  weight?: number;
  duration?: number; // in minutes for cardio
  distance?: number; // for running, cycling, etc.
  restTime?: number; // in seconds
  calories?: number; // estimated calories burned
  notes?: string;
}

interface WorkoutSession {
  exercises: WorkoutInfo[];
  totalDuration: number;
  totalCalories: number;
  workoutType: 'strength' | 'cardio' | 'mixed' | 'stretching';
}

class ExerciseAPI {
  private readonly API_NINJAS_KEY = ''; // Users can add their own key
  private readonly API_NINJAS_BASE_URL = 'https://api.api-ninjas.com/v1';
  private readonly FREE_EXERCISE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
  private readonly EXERCISE_DB_BASE_URL = 'https://exercisedb.p.rapidapi.com';

  // Cache for the free exercise database
  private exerciseCache: Exercise[] | null = null;

  async searchExercises(query: string, options?: {
    muscle?: string;
    category?: string;
    equipment?: string;
    difficulty?: string;
    limit?: number;
  }): Promise<Exercise[]> {
    const results: Exercise[] = [];
    
    try {
      // Search Free Exercise DB (always available)
      const freeDbResults = await this.searchFreeExerciseDB(query, options);
      results.push(...freeDbResults);
      
      // Search API Ninjas if key is available
      if (this.API_NINJAS_KEY) {
        const apiNinjasResults = await this.searchAPIExercises(query, options);
        results.push(...apiNinjasResults);
      }
      
      // Remove duplicates and limit results
      const uniqueResults = this.removeDuplicateExercises(results);
      return uniqueResults.slice(0, options?.limit || 10);
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  }

  async searchFreeExerciseDB(query: string, options?: {
    muscle?: string;
    category?: string;
    equipment?: string;
    difficulty?: string;
  }): Promise<Exercise[]> {
    try {
      if (!this.exerciseCache) {
        console.log('Loading exercise database...');
        const response = await fetch(this.FREE_EXERCISE_DB_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch exercises: ${response.status}`);
        }
        const exercises = await response.json();
        this.exerciseCache = exercises.map((ex: any) => this.parseFreeExerciseDB(ex));
        console.log(`Loaded ${this.exerciseCache.length} exercises from Free Exercise DB`);
      }
      
      return this.filterExercises(this.exerciseCache, query, options);
    } catch (error) {
      console.error('Error fetching Free Exercise DB:', error);
      return [];
    }
  }

  async searchAPIExercises(query: string, options?: {
    muscle?: string;
    category?: string;
    difficulty?: string;
  }): Promise<Exercise[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('name', query);
      if (options?.muscle) params.append('muscle', options.muscle);
      if (options?.category) params.append('type', options.category);
      if (options?.difficulty) params.append('difficulty', options.difficulty);
      
      const response = await fetch(`${this.API_NINJAS_BASE_URL}/exercises?${params}`, {
        headers: {
          'X-Api-Key': this.API_NINJAS_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Ninjas error: ${response.status}`);
      }
      
      const exercises = await response.json();
      return exercises.map((ex: any) => this.parseAPINinjasExercise(ex));
    } catch (error) {
      console.error('Error fetching API Ninjas exercises:', error);
      return [];
    }
  }

  private filterExercises(exercises: Exercise[], query: string, options?: {
    muscle?: string;
    category?: string;
    equipment?: string;
    difficulty?: string;
  }): Exercise[] {
    return exercises.filter(exercise => {
      // Text search
      if (query && !exercise.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      // Muscle filter
      if (options?.muscle) {
        const muscle = options.muscle.toLowerCase();
        const hasPrimary = exercise.primaryMuscles.some(m => m.toLowerCase().includes(muscle));
        const hasSecondary = exercise.secondaryMuscles?.some(m => m.toLowerCase().includes(muscle));
        if (!hasPrimary && !hasSecondary) {
          return false;
        }
      }
      
      // Category filter
      if (options?.category && exercise.category !== options.category) {
        return false;
      }
      
      // Equipment filter
      if (options?.equipment && !exercise.equipment.toLowerCase().includes(options.equipment.toLowerCase())) {
        return false;
      }
      
      // Difficulty filter
      if (options?.difficulty && exercise.difficulty !== options.difficulty) {
        return false;
      }
      
      return true;
    });
  }

  private removeDuplicateExercises(exercises: Exercise[]): Exercise[] {
    const seen = new Set<string>();
    return exercises.filter(exercise => {
      const key = exercise.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private parseFreeExerciseDB(exercise: any): Exercise {
    return {
      id: exercise.id || exercise.name.replace(/[^a-z0-9]/gi, '_'),
      name: exercise.name,
      category: exercise.category || 'strength',
      primaryMuscles: exercise.primaryMuscles || [],
      secondaryMuscles: exercise.secondaryMuscles || [],
      equipment: exercise.equipment || 'unknown',
      difficulty: exercise.level,
      force: exercise.force,
      mechanic: exercise.mechanic,
      instructions: exercise.instructions || [],
      images: exercise.images?.map((img: string) => 
        `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`
      ) || [],
      source: 'free-exercise-db'
    };
  }

  private parseAPINinjasExercise(exercise: any): Exercise {
    return {
      id: exercise.name.replace(/[^a-z0-9]/gi, '_'),
      name: exercise.name,
      category: this.mapExerciseType(exercise.type),
      primaryMuscles: [exercise.muscle],
      secondaryMuscles: [],
      equipment: exercise.equipment || 'unknown',
      difficulty: exercise.difficulty,
      instructions: exercise.instructions ? exercise.instructions.split('. ') : [],
      source: 'api-ninjas',
      type: exercise.type
    };
  }

  private mapExerciseType(type: string): Exercise['category'] {
    const typeMap: { [key: string]: Exercise['category'] } = {
      'cardio': 'cardio',
      'olympic_weightlifting': 'powerlifting',
      'plyometrics': 'plyometrics',
      'powerlifting': 'powerlifting',
      'strength': 'strength',
      'stretching': 'stretching',
      'strongman': 'strongman'
    };
    return typeMap[type] || 'strength';
  }

  // Calorie calculation based on exercise type, duration, weight, etc.
  calculateCalories(workoutInfo: WorkoutInfo, userWeight: number = 70): number {
    const { exercise, sets, reps, duration, weight } = workoutInfo;
    
    // Base metabolic rates per minute for different exercise types
    const baseMET: { [key: string]: number } = {
      'strength': 6.0,      // Weight training, vigorous
      'cardio': 8.0,        // Running, 6 mph
      'stretching': 2.5,    // Stretching, mild
      'powerlifting': 6.0,  // Weight lifting, vigorous
      'strongman': 8.0,     // Very intense
      'plyometrics': 8.0    // High intensity
    };
    
    // Equipment and muscle group modifiers
    const equipmentModifier: { [key: string]: number } = {
      'barbell': 1.2,
      'dumbbell': 1.1,
      'cable': 1.0,
      'machine': 0.9,
      'body only': 1.0,
      'kettlebell': 1.15
    };
    
    const MET = baseMET[exercise.category] || 6.0;
    const equipMod = equipmentModifier[exercise.equipment.toLowerCase()] || 1.0;
    
    let totalMinutes = 0;
    
    if (duration) {
      // Cardio exercises with duration
      totalMinutes = duration;
    } else if (sets && reps) {
      // Strength exercises - estimate time based on sets and reps
      const timePerRep = 3; // seconds
      const restBetweenSets = 60; // seconds
      const totalSeconds = (sets * reps * timePerRep) + ((sets - 1) * restBetweenSets);
      totalMinutes = totalSeconds / 60;
    } else {
      // Default to 5 minutes if no specific data
      totalMinutes = 5;
    }
    
    // Weight modifier for strength training
    let weightModifier = 1.0;
    if (exercise.category === 'strength' && weight) {
      // Higher weights = more calories (within reason)
      weightModifier = Math.min(1.5, 1.0 + (weight / 100) * 0.2);
    }
    
    // Formula: METs × weight in kg × time in hours × equipment modifier × weight modifier
    const calories = MET * userWeight * (totalMinutes / 60) * equipMod * weightModifier;
    
    return Math.round(calories);
  }

  // Get popular exercises by category
  async getPopularExercises(category?: string, limit: number = 8): Promise<Exercise[]> {
    const popularQueries = [
      'push up', 'squat', 'deadlift', 'bench press', 'pull up', 
      'plank', 'burpee', 'lunge', 'bicep curl', 'tricep dip'
    ];
    
    const results: Exercise[] = [];
    
    for (const query of popularQueries) {
      const exercises = await this.searchExercises(query, { category, limit: 1 });
      if (exercises.length > 0) {
        results.push(exercises[0]);
      }
      if (results.length >= limit) break;
    }
    
    return results;
  }

  // Get unique muscle groups for filtering
  async getMuscleGroups(): Promise<string[]> {
    if (!this.exerciseCache) {
      await this.searchFreeExerciseDB(''); // Load cache
    }
    
    const muscles = new Set<string>();
    this.exerciseCache?.forEach(exercise => {
      exercise.primaryMuscles.forEach(muscle => muscles.add(muscle));
      exercise.secondaryMuscles?.forEach(muscle => muscles.add(muscle));
    });
    
    return Array.from(muscles).sort();
  }

  // Get unique equipment types
  async getEquipmentTypes(): Promise<string[]> {
    if (!this.exerciseCache) {
      await this.searchFreeExerciseDB(''); // Load cache
    }
    
    const equipment = new Set<string>();
    this.exerciseCache?.forEach(exercise => {
      equipment.add(exercise.equipment);
    });
    
    return Array.from(equipment).sort();
  }
}

export const exerciseAPI = new ExerciseAPI();
export type { Exercise, WorkoutInfo, WorkoutSession };