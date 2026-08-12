<?php

namespace App\Console\Commands;

use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportServicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sms:import-services {file?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import services from JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        if (!$filePath) {
            $filePath = storage_path('app/services.json');
        }

        if (!File::exists($filePath)) {
            $this->error("File not found: {$filePath}");
            $this->info("Please create a JSON file with service mappings.");
            $this->info("Expected format:");
            $this->info('[{"code": "wa", "name": "WhatsApp"}, ...]');
            return 1;
        }

        $this->info("Reading services from: {$filePath}");

        $json = File::get($filePath);
        $services = json_decode($json, true);

        if (!$services || !is_array($services)) {
            $this->error("Invalid JSON format");
            return 1;
        }

        $this->info("Found " . count($services) . " services");

        $bar = $this->output->createProgressBar(count($services));
        $bar->start();

        $imported = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($services as $serviceData) {
            if (!isset($serviceData['code']) || !isset($serviceData['name'])) {
                $skipped++;
                $bar->advance();
                continue;
            }

            $code = $serviceData['code'];
            $name = $serviceData['name'];

            // Skip duplicate "full" entries
            if ($code === 'full' && Service::where('code', 'full')->exists()) {
                $skipped++;
                $bar->advance();
                continue;
            }

            $service = Service::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'is_active' => true,
                    'display_order' => $serviceData['display_order'] ?? 0
                ]
            );

            if ($service->wasRecentlyCreated) {
                $imported++;
            } else {
                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Import completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Imported', $imported],
                ['Updated', $updated],
                ['Skipped', $skipped],
                ['Total', count($services)]
            ]
        );

        return 0;
    }
}
