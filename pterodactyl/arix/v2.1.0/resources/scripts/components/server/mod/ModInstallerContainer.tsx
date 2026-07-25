import React, { useMemo, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Button } from '@/components/elements/button/index';
import { CubeTransparentIcon } from '@heroicons/react/outline';
import createDirectory from '@/api/server/files/createDirectory';
import pullFile from '@/api/server/files/pullFile';

interface ModrinthProject {
    slug: string;
    title: string;
    description?: string;
    downloads?: number;
    project_type?: string;
}

interface ModrinthVersion {
    files?: Array<{ url?: string; filename?: string }>;
}

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const [query, setQuery] = useState('fabric');
    const [results, setResults] = useState<ModrinthProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [busySlug, setBusySlug] = useState<string | null>(null);

    const searchMods = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(
                `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=8&index=relevance&facets=[%22project_type:mod%22]`
            );
            if (!response.ok) {
                throw new Error('Unable to contact Modrinth right now.');
            }

            const data = await response.json();
            setResults(data.hits || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unable to search Modrinth right now.');
        } finally {
            setLoading(false);
        }
    };

    const installMod = async (project: ModrinthProject) => {
        setBusySlug(project.slug);
        setError('');
        setMessage('');

        try {
            const versionResponse = await fetch(`https://api.modrinth.com/v2/project/${project.slug}/version`);
            if (!versionResponse.ok) {
                throw new Error('Unable to load the latest file for that project.');
            }

            const versions: ModrinthVersion[] = await versionResponse.json();
            const selectedVersion = versions[0];
            const file = selectedVersion?.files?.[0];
            if (!file?.url) {
                throw new Error('No downloadable file was returned for that project.');
            }

            const root = (directory && directory !== '/' ? directory : '/') as string;
            const targetRoot = `${root.replace(/\/$/, '')}/mods`;
            const targetDirectory = targetRoot === '/' ? '/mods' : targetRoot;

            try {
                await createDirectory(uuid, root, 'mods');
            } catch {
                // Ignore if the folder already exists.
            }

            await pullFile(uuid, file.url, targetDirectory, file.filename || `${project.slug}.jar`);
            setMessage(`${project.title} was queued for installation into the mods folder.`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'The mod could not be installed.');
        } finally {
            setBusySlug(null);
        }
    };

    const hasResults = useMemo(() => results.length > 0, [results]);

    return (
        <ServerContentBlock title={'Mod Installer'} icon={CubeTransparentIcon}>
            <div className='space-y-4'>
                <TitledGreyBox title={'Search Modrinth mods'}>
                    <div className='flex flex-col gap-3 sm:flex-row'>
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className='w-full rounded-lg border border-gray-600 bg-neutral-900 px-3 py-2 text-sm text-gray-100'
                            placeholder='Search for a mod'
                        />
                        <Button onClick={searchMods} disabled={loading || !query.trim()}>
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                    {error && <p className='mt-3 text-sm text-red-400'>{error}</p>}
                    {message && <p className='mt-3 text-sm text-green-400'>{message}</p>}
                </TitledGreyBox>

                <TitledGreyBox title={'Available mods'}>
                    {!hasResults && !loading && <p className='text-sm text-gray-400'>Search for a mod to see install options.</p>}
                    {loading && <p className='text-sm text-gray-400'>Loading mod results...</p>}
                    <div className='mt-3 space-y-3'>
                        {results.map((project) => (
                            <div key={project.slug} className='rounded-lg border border-gray-600 bg-neutral-800/70 p-4'>
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                                    <div>
                                        <p className='font-medium text-gray-100'>{project.title}</p>
                                        <p className='mt-1 text-sm text-gray-400'>
                                            {project.description || 'No description available.'}
                                        </p>
                                        {project.downloads ? (
                                            <p className='mt-2 text-xs uppercase tracking-wide text-gray-500'>
                                                Downloads: {project.downloads.toLocaleString()}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className='flex flex-wrap gap-2'>
                                        <a
                                            href={`https://modrinth.com/mod/${project.slug}`}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='text-sm text-blue-400 underline'
                                        >
                                            Open
                                        </a>
                                        <Button onClick={() => installMod(project)} disabled={busySlug === project.slug}>
                                            {busySlug === project.slug ? 'Installing...' : 'Install'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TitledGreyBox>
            </div>
        </ServerContentBlock>
    );
};
