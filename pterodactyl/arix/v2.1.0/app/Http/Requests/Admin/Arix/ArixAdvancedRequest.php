<?php

namespace Pterodactyl\Http\Requests\Admin\Arix;

use Pterodactyl\Traits\Helpers\AvailableLanguages;
use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class ArixAdvancedRequest extends AdminFormRequest
{
    use AvailableLanguages;
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'profileType' => ['required', 'string'],
            'modeToggler' => ['required', 'boolean'],
            'langSwitch' => ['required', 'boolean'],
            'defaultLang' => ['required', 'string', 'in:' . implode(',', array_keys($this->getAvailableLanguages()))],
            'languageOptions' => ['required', 'array', 'min:1'],
            'ipFlag' => ['required', 'boolean'],
            'lowResourcesAlert' => ['required', 'boolean'],
            'alertLink' => ['nullable', 'url', 'max:255'],
            'dashboardPage' => ['required', 'boolean'],
            'registration' => ['required', 'boolean'],
            'defaultMode' => ['required', 'in:darkmode,lightmode'],
            'copyright' => ['required', 'string', 'max:255'],

            'trashbin' => ['required', 'boolean'],
            'gracePeriod' => ['required', 'integer', 'min:0', 'max:30'],

            'adminTheme' => ['required', 'boolean'],

            'tierVisibility' => ['required', 'in:show,hidden'],

            'profileCustomization' => ['required', 'array'],
            'profileCustomization.username' => ['required', 'boolean'],
            'profileCustomization.name' => ['required', 'boolean'],
            'profileCustomization.email' => ['required', 'boolean'],

            'subscription' => ['required', 'array'],
            'subscription.target' => ['required', 'string', 'in:paymenter,whmcs,fake'],
            'subscription.endpoint' => ['nullable', 'url', 'max:255'],
            'subscription.identifier' => ['nullable', 'string', 'max:255'],
            'subscription.secret' => ['nullable', 'string', 'max:255'],
            'subscription.alert' => ['required', 'boolean'],

            'extensions' => ['required', 'array'],
            'extensions.pluginInstaller' => ['required', 'boolean'],
            'extensions.modInstaller' => ['required', 'boolean'],
            'extensions.footerEnabled' => ['required', 'boolean'],
            'extensions.footerText' => ['required', 'string', 'max:255'],
            'extensions.hidePterodactylFooter' => ['required', 'boolean'],
            'extensions.subdomainManager' => ['required', 'boolean'],
            'extensions.motdMaker' => ['required', 'boolean'],
            'extensions.versionChanger' => ['required', 'boolean'],
            'extensions.autoSuspension' => ['required', 'boolean'],
            'extensions.subdomainTemplate' => ['required', 'string', 'max:255'],
            'extensions.motdTemplate' => ['required', 'string', 'max:255'],
            'extensions.targetVersion' => ['required', 'string', 'max:255'],
            'extensions.suspensionThreshold' => ['required', 'integer', 'min:1', 'max:365'],
            'extensions.suspensionReason' => ['required', 'string', 'max:255'],
        ];
    }
}