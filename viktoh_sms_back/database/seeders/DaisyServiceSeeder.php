<?php

namespace Database\Seeders;

use App\Models\DaisyServiceModel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;


class DaisyServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        // Assuming you placed the JSON file in database/data/services.json
        $jsonPath = database_path('data/services.json');

        if (!File::exists($jsonPath)) {
            $this->command->error('services.json file not found.');
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        foreach ($data as $countryId => $services) {
            foreach ($services as $key => $details) {
                DaisyServiceModel::updateOrCreate(
                    ['key_name' => $key],
                    [
                        'name' => $details['name'] ?? ucfirst($key),
                        'cost' => isset($details['cost']) ? floatval($details['cost']) : null,
                    ]
                );
            }
        }

        $this->command->info('Services imported successfully!');
    }
}
