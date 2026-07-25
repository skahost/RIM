import React, { useMemo, useState } from 'react';
import EditorWrapper from '../elements/EditorWrapper';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import { Button } from '@/components/elements/button/index';
import { CubeTransparentIcon, DocumentDownloadIcon, PuzzleIcon, SparklesIcon } from '@heroicons/react/outline';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

const blueprints = [
    { id: 'plugin-installer', name: 'Plugin Installer', description: 'Plugin management blueprint', icon: PuzzleIcon, category: 'installer', key: 'pluginInstaller' as const },
    { id: 'mod-installer', name: 'Mod Installer', description: 'Mod management blueprint', icon: CubeTransparentIcon, category: 'installer', key: 'modInstaller' as const },
    { id: 'subdomain-manager', name: 'Subdomain Manager', description: 'Subdomain workflow blueprint', icon: SparklesIcon, category: 'utility', key: 'subdomainManager' as const },
    { id: 'motd-maker', name: 'MOTD Maker', description: 'MOTD templating blueprint', icon: SparklesIcon, category: 'utility', key: 'motdMaker' as const },
    { id: 'version-changer', name: 'Version Changer', description: 'Version override blueprint', icon: DocumentDownloadIcon, category: 'utility', key: 'versionChanger' as const },
    { id: 'auto-suspension', name: 'Auto Suspension', description: 'Suspension rules blueprint', icon: SparklesIcon, category: 'utility', key: 'autoSuspension' as const },
];

export default () => {
    const [search, setSearch] = useState('');
    const extensions = useStoreState((state: ApplicationStore) => state.settings.data!.arix.advanced.extensions);

    const filtered = useMemo(() => blueprints.filter((bp) => bp.name.toLowerCase().includes(search.toLowerCase())), [search]);

    const toggleBlueprint = (key: keyof typeof extensions) => {
        const next = { ...extensions, [key]: !extensions[key] };
        // Persist through the existing advanced settings API later if needed.
        console.log('Blueprint toggled', key, next[key]);
    };

    return (
        <EditorWrapper title='Blueprint Extensions'>
            <div className='px-6 space-y-4'>
                <div>
                    <Label htmlFor='blueprint-search'>Search blueprints</Label>
                    <Input id='blueprint-search' placeholder='Search blueprint extensions...' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {filtered.map((blueprint) => {
                    const Icon = blueprint.icon;
                    const enabled = Boolean(extensions?.[blueprint.key]);
                    return (
                        <TitledGreyBox key={blueprint.id} title={blueprint.name}>
                            <div className='flex items-center justify-between gap-3'>
                                <div className='flex items-center gap-2'>
                                    <Icon className='w-5 h-5 text-gray-300' />
                                    <div>
                                        <p className='text-sm text-gray-200'>{blueprint.description}</p>
                                        <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>{blueprint.category}</p>
                                    </div>
                                </div>
                                <Button.Text size={Button.Sizes.Small} onClick={() => toggleBlueprint(blueprint.key)}>
                                    {enabled ? 'Enabled' : 'Enable'}
                                </Button.Text>
                            </div>
                        </TitledGreyBox>
                    );
                })}
            </div>
        </EditorWrapper>
    );
};
